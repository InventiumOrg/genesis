package cluster

import (
	"log/slog"

	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type DKOSCluster struct {
	Region    string
	Name      string
	Size      string
	AutoScale bool
	NodeCount int
	Version   string
}

func (d *DKOSCluster) NewDKOSCluster(ctx *pulumi.Context, vpc *digitalocean.Vpc) (*digitalocean.KubernetesCluster, error) {
	dkosCluster, err := digitalocean.NewKubernetesCluster(ctx, d.Name, &digitalocean.KubernetesClusterArgs{
		NodePool: &digitalocean.KubernetesClusterNodePoolArgs{
			Name: pulumi.String(d.Name),
			Size: pulumi.String(d.Size),
			// Size:      digitalocean.DropletSlug_DropletS2VCPU4GB_AMD,
			AutoScale: pulumi.Bool(d.AutoScale),
			Labels: pulumi.StringMap{
				"name": pulumi.String(d.Name),
			},
			NodeCount: pulumi.Int(d.NodeCount),
			Tags: pulumi.StringArray{
				pulumi.String(d.Name),
			},
			Taints: digitalocean.KubernetesClusterNodePoolTaintArray{
				&digitalocean.KubernetesClusterNodePoolTaintArgs{
					Effect: pulumi.String("PreferNoSchedule"),
					Key:    pulumi.String("string"),
					Value:  pulumi.String("string"),
				},
			},
		},
		Region:                        pulumi.String(d.Region),
		Version:                       pulumi.String("1.30.4-do.0"),
		AutoUpgrade:                   pulumi.Bool(false),
		DestroyAllAssociatedResources: pulumi.Bool(false),
		Ha:                            pulumi.Bool(false),
		Name:                          pulumi.String(d.Name),
		RegistryIntegration:           pulumi.Bool(false),
		SurgeUpgrade:                  pulumi.Bool(false),
		Tags: pulumi.StringArray{
			pulumi.String("string"),
		},
		VpcUuid: vpc.ID(),
	}, pulumi.Timeouts(&pulumi.CustomTimeouts{
		Create: "5m",
		Delete: "5m",
	}), pulumi.Parent(vpc))

	if err != nil {
		slog.Error(err.Error())
		return nil, err
	}
	return dkosCluster, nil
}
