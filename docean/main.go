package main

import (
	"inventium/infrastructure"
	"log/slog"

	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		err := infrastructure.CreateInfrastructure(ctx)
		if err != nil {
			slog.Error("Error creating VPC", slog.Any("error", err))
			return err
		}
		return nil

	})

}
