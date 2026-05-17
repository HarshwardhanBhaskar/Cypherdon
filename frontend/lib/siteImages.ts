const asset = (path: string) => encodeURI(path);

export const siteImages = {
  auth: {
    login: asset("/generated/Login  auth background/loginCypherdon.png"),
    completeProfile: asset("/generated/Login  auth background/Profile  resume section visual.png"),
  },
  landing: {
    heroBackground: asset("/generated/landingpage images/Hero Background.png"),
    heroVisual: asset("/generated/landingpage images/Hero ForegroundProduct Visual.png"),
    resumeFeature: asset("/generated/landingpage images/Resume Analysis Feature.png"),
    matchingFeature: asset("/generated/landingpage images/Job Matching Feature.png"),
    automationFeature: asset("/generated/landingpage images/Automation  Application Workflow.png"),
    brandSection: asset("/generated/landingpage images/Brand  About Section.png"),
  },
  app: {
    dashboard: asset("/generated/dashboard background/dashboard background.png"),
    profile: asset("/generated/profile  resume workspace/profile  resume workspace.png"),
    automation: asset("/generated/job matching  automation product visual/job matching  automation visual.png"),
  },
  marketing: {
    cta: asset("/generated/CTA  final section background/CTA  final section background.png"),
    pricing: asset("/generated/Pricing  contact section visual/Pricing  contact section visual.png"),
    trust: asset("/generated/Trust  testimonial section visual/Trust  testimonial section visual.png"),
  },
};
