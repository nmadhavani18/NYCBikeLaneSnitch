import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { PROD_STAGE } from '../lib/constants';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'NYCBikeLaneSnitchVPCStack', {
  env: {
    account: PROD_STAGE.DEPLOY_ACCOUNT,
    region: PROD_STAGE.DEPLOY_REGION,
  },
});

const lambdaStack = new LambdaStack(app, 'NYCBikeLaneSnitchLambdaStack', {
  vpc: vpcStack.vpc,
  env: {
    account: PROD_STAGE.DEPLOY_ACCOUNT,
    region: PROD_STAGE.DEPLOY_REGION,
  },
});

lambdaStack.addDependency(vpcStack);

// TODO either add dynamodb stack or use RDS
