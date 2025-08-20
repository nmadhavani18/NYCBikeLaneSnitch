export enum STAGE_NAME {
  PROD,
}

export interface STAGE {
  DEPLOY_REGION: string;
  DEPLOY_ACCOUNT: string;
  STAGE_NAME: STAGE_NAME;
}

export const PROD_STAGE = {
  DEPLOY_REGION: 'us-east-1',
  DEPLOY_ACCOUNT: '635394567014',
  STAGE_NAME: STAGE_NAME.PROD,
};
