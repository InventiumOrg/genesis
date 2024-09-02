package jenkins

import (
	"log/slog"

	appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/apps/v1"
	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewJenkinsServer(ctx *pulumi.Context, provider pulumi.ProviderResource, dependent pulumi.Resource) {
	jenkinsNameSpace, err := corev1.NewNamespace(ctx, "inventiumdev02-management", &corev1.NamespaceArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("inventiumdev01-management"),
		},
	}, pulumi.Providers(provider), pulumi.Parent(dependent))
	if err != nil {
		slog.Error("Error creating namespace", slog.Any("error", err))
	}
	_, err = appsv1.NewDeployment(ctx, "jenkins", &appsv1.DeploymentArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name:      pulumi.String("jenkins"),
			Namespace: jenkinsNameSpace.Metadata.Name().ToStringPtrOutput(),
		},
		Spec: &appsv1.DeploymentSpecArgs{
			Replicas: pulumi.Int(1),
			Selector: &metav1.LabelSelectorArgs{
				MatchLabels: pulumi.StringMap{
					"app": pulumi.String("jenkins-server"),
				},
			},
			Template: &corev1.PodTemplateSpecArgs{
				Metadata: &metav1.ObjectMetaArgs{
					Labels: pulumi.StringMap{
						"app": pulumi.String("jenkins-server"),
					},
				},
				Spec: &corev1.PodSpecArgs{
					SecurityContext: &corev1.PodSecurityContextArgs{
						RunAsUser: pulumi.Int(1000),
						FsGroup:   pulumi.Int(1000),
					},
					ServiceAccountName: pulumi.String("jenkins-admin"),
					Containers: corev1.ContainerArray{
						&corev1.ContainerArgs{
							Name:  pulumi.String("jenkins"),
							Image: pulumi.String("jenkins/jenkins:lts"),
							Resources: &corev1.ResourceRequirementsArgs{
								Limits: pulumi.StringMap{
									"cpu":    pulumi.String("1000m"),
									"memory": pulumi.String("2Gi"),
								},
								Requests: pulumi.StringMap{
									"cpu":    pulumi.String("500m"),
									"memory": pulumi.String("500Mi"),
								},
							},
							Ports: corev1.ContainerPortArray{
								&corev1.ContainerPortArgs{
									ContainerPort: pulumi.Int(8080),
									Name:          pulumi.String("http"),
								},
							},
							LivenessProbe: &corev1.ProbeArgs{
								HttpGet: &corev1.HTTPGetActionArgs{
									Path: pulumi.String("/login"),
									Port: pulumi.Int(8080),
								},
								InitialDelaySeconds: pulumi.Int(90),
								PeriodSeconds:       pulumi.Int(10),
								TimeoutSeconds:      pulumi.Int(5),
								FailureThreshold:    pulumi.Int(5),
							},
							ReadinessProbe: &corev1.ProbeArgs{
								HttpGet: &corev1.HTTPGetActionArgs{
									Path: pulumi.String("/login"),
									Port: pulumi.Int(8080),
								},
								InitialDelaySeconds: pulumi.Int(60),
								PeriodSeconds:       pulumi.Int(10),
								TimeoutSeconds:      pulumi.Int(5),
								FailureThreshold:    pulumi.Int(3),
							},
							VolumeMounts: &corev1.VolumeMountArray{
								&corev1.VolumeMountArgs{
									Name:      pulumi.String("jenkins-data"),
									MountPath: pulumi.String("/var/jenkins_home"),
								},
							},
						},
					},
					Volumes: &corev1.VolumeArray{
						&corev1.VolumeArgs{
							Name: pulumi.String("jenkins-data"),
							PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSourceArgs{
								ClaimName: pulumi.String("jenkins-pvc"),
							},
						},
					},
				},
			},
		},
	}, pulumi.Providers(provider), pulumi.Timeouts(&pulumi.CustomTimeouts{
		Create: "5m"}), pulumi.Parent(jenkinsNameSpace))
	if err != nil {
		slog.Error("Error creating Jenkins Deployment", slog.Any("error", err))
	}

	_, err = corev1.NewService(ctx, "jenkins-service", &corev1.ServiceArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name:      pulumi.String("jenkins-service"),
			Namespace: jenkinsNameSpace.Metadata.Name().ToStringPtrOutput(),
			Annotations: pulumi.StringMap{
				"prometheus.io/scrape": pulumi.String("true"),
				"prometheus.io/port":   pulumi.String("8080"),
				"prometheus.io/path":   pulumi.String("/"),
			},
		},
		Spec: &corev1.ServiceSpecArgs{
			Selector: pulumi.StringMap{
				"app": pulumi.String("jenkins-server"),
			},
			Type: pulumi.String("ClusterIP"),
			Ports: corev1.ServicePortArray{
				corev1.ServicePortArgs{
					Port:       pulumi.Int(80),
					TargetPort: pulumi.Int(8080),
				},
			},
		},
	}, pulumi.Providers(provider), pulumi.Timeouts(&pulumi.CustomTimeouts{
		Create: "5m"}), pulumi.Parent(jenkinsNameSpace))
	if err != nil {
		slog.Error("Error creating Jenkins Service", slog.Any("error", err))
	}

	if err := NewServiceAccount(ctx, provider, jenkinsNameSpace); err != nil {
		slog.Error("Error creating Jenkins RBAC", slog.Any("error", err))
	}
	if err := NewJenkinsPV(ctx, jenkinsNameSpace.Metadata.Name().ToStringPtrOutput(), provider, jenkinsNameSpace); err != nil {
		slog.Error("Error creating Jenkins PV", slog.Any("error", err))
	}
}
