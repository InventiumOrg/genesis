package externaldns

import (
	"log/slog"

	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	rbacv1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/rbac/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewServiceAccount(ctx *pulumi.Context, provider pulumi.ProviderResource, depedent pulumi.Resource) error {
	_, err := corev1.NewServiceAccount(ctx, "external-dns", &corev1.ServiceAccountArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("external-dns"),
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating service account", slog.Any("error", err))
		return err
	}

	_, err = rbacv1.NewClusterRole(ctx, "external-dns", &rbacv1.ClusterRoleArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("external-dns"),
		},
		Rules: rbacv1.PolicyRuleArray{
			rbacv1.PolicyRuleArgs{
				ApiGroups: pulumi.StringArray{
					pulumi.String(""),
				},
				Resources: pulumi.StringArray{
					pulumi.String("services"),
					pulumi.String("endpoints"),
					pulumi.String("pods"),
				},
				Verbs: pulumi.StringArray{
					pulumi.String("get"),
					pulumi.String("watch"),
					pulumi.String("list"),
				},
			},
			rbacv1.PolicyRuleArgs{
				ApiGroups: pulumi.StringArray{
					pulumi.String("extensions"),
					pulumi.String("networking.k8s.io"),
				},
				Resources: pulumi.StringArray{
					pulumi.String("ingreses"),
				},
				Verbs: pulumi.StringArray{
					pulumi.String("get"),
					pulumi.String("watch"),
					pulumi.String("list"),
				},
			},
			rbacv1.PolicyRuleArgs{
				ApiGroups: pulumi.StringArray{
					pulumi.String(""),
				},
				Resources: pulumi.StringArray{
					pulumi.String("nodes"),
				},
				Verbs: pulumi.StringArray{
					pulumi.String("watch"),
					pulumi.String("list"),
				},
			},
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating cluster role", slog.Any("error", err))
		return err
	}

	_, err = rbacv1.NewClusterRoleBinding(ctx, "external-dns", &rbacv1.ClusterRoleBindingArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("external-dns-viewer"),
		},
		RoleRef: rbacv1.RoleRefArgs{
			ApiGroup: pulumi.String("rbac.authorization.k8s.io"),
			Kind:     pulumi.String("ClusterRole"),
			Name:     pulumi.String("external-dns"),
		},
		Subjects: rbacv1.SubjectArray{
			rbacv1.SubjectArgs{
				Kind:      pulumi.String("ServiceAccount"),
				Name:      pulumi.String("external-dns"),
				Namespace: pulumi.String("default"),
			},
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating cluster role binding", slog.Any("error", err))
		return err
	}
	return nil
}
