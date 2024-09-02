package infrastructure

import (
	"fmt"
	loginoauth "inventium/application/login-oauth"
	"inventium/infrastructure/cluster"
	externaldns "inventium/infrastructure/cluster/external_dns"
	"inventium/infrastructure/cluster/jenkins"
	"inventium/infrastructure/network"
	"log/slog"

	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes"

	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

const (
	k8sVersion  = "1.30.2-do.0"
	clusterName = "inventiumdev02"
	region      = "sgp1"
	vpcCidr     = "10.150.8.0/21"
	edition     = "sandbox"
)

func CreateInfrastructure(ctx *pulumi.Context) error {
	vpc, err := network.NewVPC(ctx, clusterName, region, vpcCidr)
	if err != nil {
		slog.Error("Error creating VPC", slog.Any("error", err))
		return err
	}

	d := cluster.DKOSCluster{
		Region:    region,
		Name:      clusterName,
		Size:      "s-2vcpu-4gb",
		AutoScale: false,
		NodeCount: 1,
		Version:   k8sVersion,
	}

	dkosCluster, err := d.NewDKOSCluster(ctx, vpc)
	if err != nil {
		slog.Error("Error creating DKOS cluster", slog.Any("error", err))
		return err
	}
	kubeConfigOutput := dkosCluster.KubeConfigs.ApplyT(func(kubeConfigs []digitalocean.KubernetesClusterKubeConfig) (string, error) {
		if len(kubeConfigs) > 0 {
			return *kubeConfigs[0].RawConfig, nil
		}
		return "", fmt.Errorf("no kubeconfigs found")
	}).(pulumi.StringOutput)

	// Convert `pulumi.StringOutput` to `*string` for use in Kubernetes provider
	kubeConfigPtr := kubeConfigOutput.ApplyT(func(config string) *string {
		return pulumi.StringRef(config)
	}).(pulumi.StringPtrOutput)

	// Create a Kubernetes provider
	k8sProvider, err := kubernetes.NewProvider(ctx, "k8s-provider", &kubernetes.ProviderArgs{
		Kubeconfig: kubeConfigPtr,
	})
	if err != nil {
		return err
	}
	network.NewLoadBalancer(ctx, dkosCluster)
	jenkins.NewJenkinsServer(ctx, k8sProvider, dkosCluster)
	externaldns.NewExternalDNS(ctx, k8sProvider, dkosCluster)
	loginoauth.NewChart()
	return nil

}
