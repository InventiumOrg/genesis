package externaldns

import (
	"log/slog"

	appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/apps/v1"
	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewExternalDNS(ctx *pulumi.Context, provider pulumi.ProviderResource, dependent pulumi.Resource) error {
	err := NewSecret(ctx, provider, dependent)
	if err != nil {
		slog.Error("Error creating external-dns secret for CloudFlare", slog.Any("error", err))
		return err
	}

	_, err = appsv1.NewDeployment(ctx, "external-dns", &appsv1.DeploymentArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("external-dns"),
		},
		Spec: &appsv1.DeploymentSpecArgs{
			Strategy: &appsv1.DeploymentStrategyArgs{
				Type: pulumi.String("Recreate"),
			},
			Selector: &metav1.LabelSelectorArgs{
				MatchLabels: pulumi.StringMap{
					"app": pulumi.String("external-dns"),
				},
			},
			Template: &corev1.PodTemplateSpecArgs{
				Metadata: &metav1.ObjectMetaArgs{
					Labels: pulumi.StringMap{
						"app": pulumi.String("external-dns"),
					},
				},
				Spec: &corev1.PodSpecArgs{
					ServiceAccountName: pulumi.String("external-dns"),
					Containers: &corev1.ContainerArray{
						&corev1.ContainerArgs{
							Name:  pulumi.String("external-dns"),
							Image: pulumi.String("k8s.gcr.io/external-dns/external-dns:v0.15.0"),
							Args:  pulumi.StringArray{},
							Env: corev1.EnvVarArray{
								corev1.EnvVarArgs{
									Name: pulumi.String("CF_API_KEY"),
									ValueFrom: &corev1.EnvVarSourceArgs{
										SecretKeyRef: &corev1.SecretKeySelectorArgs{
											Name: pulumi.String("cloudflare-api-key"),
											Key:  pulumi.String("apiKey"),
										},
									},
								},
								corev1.EnvVarArgs{
									Name: pulumi.String("CF_API_EMAIL"),
									ValueFrom: &corev1.EnvVarSourceArgs{
										SecretKeyRef: &corev1.SecretKeySelectorArgs{
											Name: pulumi.String("cloudflare-api-key"),
											Key:  pulumi.String("email"),
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}, pulumi.Providers(provider), pulumi.Parent(dependent))
	if err != nil {
		slog.Error("Error creating external-dns deployment", slog.Any("error", err))
	}

	err = NewServiceAccount(ctx, provider, dependent)
	if err != nil {
		slog.Error("Error creating external-dns service account", slog.Any("error", err))
		return err
	}

	return nil
}
