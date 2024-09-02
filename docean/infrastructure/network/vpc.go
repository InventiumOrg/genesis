package network

import (
	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewVPC(ctx *pulumi.Context, name, region, cidr string) (*digitalocean.Vpc, error) {
	vpc, err := digitalocean.NewVpc(ctx, name, &digitalocean.VpcArgs{
		Name:    pulumi.String(name),
		Region:  pulumi.String(region),
		IpRange: pulumi.String(cidr),
	}, pulumi.Timeouts(&pulumi.CustomTimeouts{
		Create: "5m",
		Delete: "5m",
	}))
	if err != nil {
		return nil, err
	}
	return vpc, nil
}
