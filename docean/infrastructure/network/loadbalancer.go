package network

import (
	"inventium/utils"
	"log/slog"
	"strconv"

	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewLoadBalancer(ctx *pulumi.Context, depedent pulumi.Resource) error {
	dkosNodes, err := utils.GetDroplets(ctx, "inventiumdev02")

	if err != nil {
		slog.Error("Error getting droplets", slog.Any("error", err))
		return err
	}

	nodeID, _ := strconv.ParseInt(dkosNodes.Id, 10, 64)
	_, err = digitalocean.NewLoadBalancer(ctx, "public", &digitalocean.LoadBalancerArgs{
		Name:   pulumi.String("inventiumdev02-lb"),
		Region: pulumi.String(digitalocean.RegionSGP1),
		ForwardingRules: digitalocean.LoadBalancerForwardingRuleArray{
			&digitalocean.LoadBalancerForwardingRuleArgs{
				EntryPort:      pulumi.Int(80),
				EntryProtocol:  pulumi.String("http"),
				TargetPort:     pulumi.Int(30996),
				TargetProtocol: pulumi.String("http"),
			},
			&digitalocean.LoadBalancerForwardingRuleArgs{
				EntryPort:      pulumi.Int(443),
				EntryProtocol:  pulumi.String("https"),
				TargetPort:     pulumi.Int(32324),
				TargetProtocol: pulumi.String("https"),
			},
		},
		Healthcheck: &digitalocean.LoadBalancerHealthcheckArgs{
			Port:     pulumi.Int(10256),
			Protocol: pulumi.String("http"),
			Path:     pulumi.String("/healthz"),
		},
		DropletIds: pulumi.IntArray{
			pulumi.Int(nodeID),
		},
	}, pulumi.DependsOn([]pulumi.Resource{depedent}))
	if err != nil {
		return err
	}
	return nil

}
