package externaldns

import (
	"log/slog"

	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewSecret(ctx *pulumi.Context, provider pulumi.ProviderResource, dependent pulumi.Resource) error {
	_, err := corev1.NewSecret(ctx, "cloudflare-api-key", &corev1.SecretArgs{
		Metadata: &metav1.ObjectMetaArgs{
			Name: pulumi.String("cloudflare-api-key"),
		},
		Type: pulumi.String("Opaque"),
		Data: pulumi.StringMap{
			"apiKey": pulumi.String("CNIChxpZYMPCT-2bYQIdSPyqWPazMRqDVcbs4OPE"),
		},
	}, pulumi.Providers(provider), pulumi.Parent(dependent))
	if err != nil {
		slog.Error("Error creating secret", slog.Any("error", err))
		return err
	}
	return nil
}
