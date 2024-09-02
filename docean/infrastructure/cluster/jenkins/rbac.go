package jenkins

import (
	"log/slog"

	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	rbacv1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/rbac/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewServiceAccount(ctx *pulumi.Context, provider pulumi.ProviderResource, depedent pulumi.Resource) error {
	_, err := corev1.NewServiceAccount(ctx, "jenkins-admin", &corev1.ServiceAccountArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name:      pulumi.String("jenkins-admin"),
			Namespace: pulumi.String("inventiumdev02-management"),
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating service account", slog.Any("error", err))
		return err
	}

	_, err = rbacv1.NewClusterRole(ctx, "jenkins-admin", &rbacv1.ClusterRoleArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("jenkins-admin"),
		},
		Rules: rbacv1.PolicyRuleArray{
			rbacv1.PolicyRuleArgs{
				ApiGroups: pulumi.StringArray{
					pulumi.String(""),
				},
				Resources: pulumi.StringArray{
					pulumi.String("*"),
				},
				Verbs: pulumi.StringArray{
					pulumi.String("*"),
				},
			},
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating cluster role", slog.Any("error", err))
		return err
	}

	_, err = rbacv1.NewClusterRoleBinding(ctx, "jenkins-admin", &rbacv1.ClusterRoleBindingArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("jenkins-admin"),
		},
		RoleRef: rbacv1.RoleRefArgs{
			ApiGroup: pulumi.String("rbac.authorization.k8s.io"),
			Kind:     pulumi.String("ClusterRole"),
			Name:     pulumi.String("jenkins-admin"),
		},
		Subjects: rbacv1.SubjectArray{
			rbacv1.SubjectArgs{
				Kind:      pulumi.String("ServiceAccount"),
				Name:      pulumi.String("jenkins-admin"),
				Namespace: pulumi.String("inventiumdev01-management"),
			},
		},
	}, pulumi.Providers(provider), pulumi.Parent(depedent))
	if err != nil {
		slog.Error("Error creating cluster role binding", slog.Any("error", err))
		return err
	}
	return nil
}
