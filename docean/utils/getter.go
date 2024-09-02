package utils

import (
	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func GetDroplets(ctx *pulumi.Context, clusterName string) (*digitalocean.GetDropletsResult, error) {
	dkosNodes, err := digitalocean.GetDroplets(ctx, &digitalocean.GetDropletsArgs{
		Filters: []digitalocean.GetDropletsFilter{
			{
				Key: "tags",
				Values: []string{
					clusterName,
				},
			},
		},
	}, nil)
	if err != nil {
		return nil, err
	}
	return dkosNodes, nil
}
