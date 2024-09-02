package loginoauth

import (
	helmv4 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/helm/v4"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func NewChart() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := helmv4.NewChart(ctx, "login-oauth", &helmv4.ChartArgs{
			Chart:   pulumi.String("oci://205098647215.dkr.ecr.ap-southeast-1.amazonaws.com/inventium/chart/login-oauth"),
			Version: pulumi.String("0.2.0"),
		})
		if err != nil {
			return err
		}
		return nil
	})
}
