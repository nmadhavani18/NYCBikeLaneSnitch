import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import {Duration} from "aws-cdk-lib";

interface RdsStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class RdsStack extends cdk.Stack {
    public readonly instance: rds.DatabaseInstance;

    constructor(scope: Construct, id: string, props: RdsStackProps) {
        super(scope, id, props);

        // Create security group for RDS
        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
            vpc: props.vpc,
            description: 'Security group for RDS instance',
            allowAllOutbound: false,
        });

        // Create RDS instance
        this.instance = new rds.DatabaseInstance(this, 'Database', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_15,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [dbSecurityGroup],
            databaseName: 'appdb',
            maxAllocatedStorage: 20, // Maximum storage in GB
            allocatedStorage: 20,    // Initial storage in GB
            backupRetention: Duration.days(0)
        });
    }
}