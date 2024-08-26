package main

import (
	"inventium/infrastructure"
	"log/slog"

	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

const (
	k8sVersion  = "1.30.2-do.0"
	clusterName = "inventiumdev01"
	region      = "sgp1"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		inventiumVpc, err := digitalocean.NewVpc(ctx, "inventium", &digitalocean.VpcArgs{
			Name:   pulumi.String("inventium"),
			Region: pulumi.String("sgp1"),
		})
		if err != nil {
			return err
		}
		d := infrastructure.DKOSCluster{
			Region:    region,
			Name:      clusterName,
			Size:      "s-2vcpu-4gb",
			AutoScale: false,
			NodeCount: 1,
			Version:   k8sVersion,
		}
		_, err = d.NewDKOSCluster(ctx, inventiumVpc)
		if err != nil {
			slog.Error("Error creating DKOS cluster", slog.Any("error", err))
			return err
		}
		slog.Info("Creating DKOS Cluster")
		return nil
	})
}
