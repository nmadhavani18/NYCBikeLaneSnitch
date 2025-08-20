import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface LambdaStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class LambdaStack extends cdk.Stack {
  public readonly handler: lambda.Function;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Create security group for Lambda
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc: props.vpc,
      description: 'Security group for Lambda function',
      allowAllOutbound: true,
    });

    // Create Lambda function using NodejsFunction construct for TypeScript support
    this.handler = new nodejs.NodejsFunction(this, 'Handler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../service/handlers/hello-world.ts'),
      handler: 'handler',
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        sourceMap: true,
        minify: false,
      },
      logRetention: RetentionDays.TWO_WEEKS,
    });

    // Create API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'NYCBikeLaneSnitchAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        stageName: 'prod',
        metricsEnabled: false,
        loggingLevel: apigateway.MethodLoggingLevel.OFF,
        dataTraceEnabled: false,
      },
    });

    // Create API resources and methods
    const apiResource = this.api.root.addResource('api');

    // Add GET method for /api
    apiResource.addMethod('GET', new apigateway.LambdaIntegration(this.handler), {
      operationName: 'GetHelloWorld'
    });

    // Add POST method for /api
    apiResource.addMethod('POST', new apigateway.LambdaIntegration(this.handler), {
      operationName: 'PostHelloWorld'
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API URL',
    });
  }
}
