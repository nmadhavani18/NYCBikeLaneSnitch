// lib/vpc-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly natInstance: ec2.Instance;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'VPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // Create a security group for the NAT Instance
    const natSecurityGroup = new ec2.SecurityGroup(this, 'NatInstanceSG', {
      vpc: this.vpc,
      description: 'Security group for NAT Instance',
      allowAllOutbound: true,
    });

    natSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.allTraffic(),
      'Allow all traffic from VPC',
    );

    // Create NAT Instance in public subnet
    this.natInstance = new ec2.Instance(this, 'NatInstance', {
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: ec2.AmazonLinuxCpuType.X86_64,
      }),
      securityGroup: natSecurityGroup,
      sourceDestCheck: false,
    });

    // Add routes from private subnets to NAT Instance
    this.vpc.privateSubnets.forEach((subnet, index) => {
      const cfnSubnet = subnet.node.defaultChild as ec2.CfnSubnet;
      const routeTable = new ec2.CfnRouteTable(this, `RouteTable-${index}`, {
        vpcId: this.vpc.vpcId,
      });
      new ec2.CfnRoute(this, `Route-${index}`, {
        routeTableId: routeTable.ref,
        destinationCidrBlock: '0.0.0.0/0',
        instanceId: this.natInstance.instanceId,
      });
      new ec2.CfnSubnetRouteTableAssociation(this, `RouteAssoc-${index}`, {
        routeTableId: routeTable.ref,
        subnetId: cfnSubnet.ref,
      });
    });
  }
}
