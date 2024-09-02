package jenkins

import (
	"inventium/utils"
	"log/slog"

	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	storagev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/storage/v1"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewJenkinsPV(ctx *pulumi.Context, namespace pulumi.StringPtrOutput, provider pulumi.ProviderResource, depedent pulumi.Resource) error {
	_, err := storagev1.NewStorageClass(ctx, "local-storage", &storagev1.StorageClassArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("local-storage"),
		},
		Provisioner:       pulumi.String("kubernetes.io/no-provisioner"),
		VolumeBindingMode: pulumi.String("WaitForFirstConsumer"),
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating storage class", slog.Any("error", err))
	}

	dkosNodes, err := utils.GetDroplets(ctx, "inventiumdev02")
	if err != nil {
		return err
	}
	var nodeNames []string
	for _, dkosNode := range dkosNodes.Droplets {
		nodeNames = append(nodeNames, dkosNode.Name)
	}
	_, err = corev1.NewPersistentVolume(ctx, "jenkins-pv", &corev1.PersistentVolumeArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("jenkins-pv"),
			Labels: pulumi.StringMap{
				"type": pulumi.String("local"),
			},
		},
		Spec: &corev1.PersistentVolumeSpecArgs{
			StorageClassName: pulumi.String("local-storage"),
			ClaimRef: &corev1.ObjectReferenceArgs{
				Name:      pulumi.String("jenkins-pvc"),
				Namespace: namespace,
			},
			Capacity: pulumi.StringMap{
				"storage": pulumi.String("10Gi"),
			},
			AccessModes: pulumi.StringArray{
				pulumi.String("ReadWriteOnce"),
			},
			Local: &corev1.LocalVolumeSourceArgs{
				Path: pulumi.String("/mnt"),
			},
			NodeAffinity: &corev1.VolumeNodeAffinityArgs{
				Required: corev1.NodeSelectorArgs{
					NodeSelectorTerms: corev1.NodeSelectorTermArray{
						corev1.NodeSelectorTermArgs{
							MatchExpressions: corev1.NodeSelectorRequirementArray{
								corev1.NodeSelectorRequirementArgs{
									Key:      pulumi.String("kubernetes.io/hostname"),
									Operator: pulumi.String("In"),
									Values:   pulumi.ToStringArray(nodeNames),
								},
							},
						},
					},
				},
			},
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating persistent volume", slog.Any("error", err))
		return err
	}
	_, err = corev1.NewPersistentVolumeClaim(ctx, "jenkins-pvc", &corev1.PersistentVolumeClaimArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name:      pulumi.String("jenkins-pvc"),
			Namespace: namespace,
		},
		Spec: &corev1.PersistentVolumeClaimSpecArgs{
			StorageClassName: pulumi.String("local-storage"),
			AccessModes: pulumi.StringArray{
				pulumi.String("ReadWriteOnce"),
			},
			Resources: corev1.VolumeResourceRequirementsArgs{
				Requests: pulumi.StringMap{
					"storage": pulumi.String("3Gi"),
				},
			},
		},
	}, pulumi.Provider(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating persistent volume claim", slog.Any("error", err))
		return err
	}
	return nil
}
