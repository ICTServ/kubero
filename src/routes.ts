import express, { Express, Request, Response } from 'express';
import { IApp, IPipeline } from './types';
import { App } from './modules/application';
import { IAddonMinimal } from './modules/addons';

export const Router = express.Router();

// create a pipeline
Router.post('/pipelines', async function (req: Request, res: Response) {
    let pipeline: IPipeline = { 
        name: req.body.pipelineName, 
        phases: req.body.phases,
        buildpack: req.body.buildpack,
        reviewapps: req.body.reviewapps,
        github: req.body.github,
        dockerimage: req.body.dockerimage,
        deploymentstrategy: req.body.deploymentstrategy,
    }; 
    req.app.locals.kubero.newPipeline(pipeline);
    res.send("new");
});

// get a list of pipelines
Router.get('/pipelines', async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.kubero.listPipelines();
    res.send(pipelines);
});

// get a pipeline
Router.get('/pipelines/:pipeline', async function (req: Request, res: Response) {
    let pipeline = await req.app.locals.kubero.getPipeline(req.params.pipeline);
    res.send(pipeline);
});

// delete a pipeline
Router.delete('/pipelines/:pipeline', async function (req: Request, res: Response) {
    let pipelines = await req.app.locals.kubero.deletePipeline(req.params.pipeline);
    res.send(pipelines);
});

// create a app
Router.post('/apps', async function (req: Request, res: Response) {
    
    let appconfig: IApp = {
        name: req.body.appname,
        pipeline: req.body.pipeline,
        phase: req.body.phase,
        buildpack: req.body.buildpack,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        domain: req.body.domain,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
        image: {
            repository: req.body.image.repository,
            tag: req.body.image.tag || "main",
            pullPolicy: "Always",
        },
        web: {
            replicaCount: req.body.webreplicas,
            autoscaling: {
                minReplicas: req.body.webreplicasrange[0] || 1,
                maxReplicas: req.body.webreplicasrange[1] || 0,
                targetCPUUtilizationPercentage: req.body.webtargetCPUUtilizationPercentage || 80,
                targetMemoryUtilizationPercentage: req.body.webtargetMemoryUtilizationPercentage || 0
            }
        },
        worker: {
            replicaCount: req.body.workerreplicas,
            autoscaling: {
                minReplicas: req.body.workerreplicasrange[0] || 0,
                maxReplicas: req.body.workerreplicasrange[1] || 0,
                targetCPUUtilizationPercentage: req.body.workertargetCPUUtilizationPercentage || 80,
                targetMemoryUtilizationPercentage: req.body.workertargetMemoryUtilizationPercentage || 0
            }
        },
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
    };

    let app = new App(appconfig);
    
    req.app.locals.kubero.newApp(app);
    res.send("new");
});

// delete an app
Router.delete('/pipelines/:pipeline/:phase/:app', async function (req: Request, res: Response) {
    await req.app.locals.kubero.deleteApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("deleted");
});

// update a app in a specific pipeline
Router.put('/pipelines/:pipeline/:phase/:app', async function (req: Request, res: Response) {

    let appconfig: IApp = {
        name: req.params.app,
        pipeline: req.params.pipeline,
        phase: req.params.phase,

        buildpack: req.body.buildpack,
        gitrepo: req.body.gitrepo,
        branch: req.body.branch,
        autodeploy: req.body.autodeploy,
        domain: req.body.domain,
        podsize: req.body.podsize,
        autoscale: req.body.autoscale,
        envVars: req.body.envvars,
        image: {
            repository: req.body.image.repository,
            tag: req.body.image.tag || "main",
            pullPolicy: "Always",
        },
        web: {
            replicaCount: req.body.webreplicas,
            autoscaling: {
                minReplicas: req.body.webreplicasrange[0] || 1,
                maxReplicas: req.body.webreplicasrange[1] || 0,
                targetCPUUtilizationPercentage: req.body.webtargetCPUUtilizationPercentage || 80,
                targetMemoryUtilizationPercentage: req.body.webtargetMemoryUtilizationPercentage || 0
            }
        },
        worker: {
            replicaCount: req.body.workerreplicas,
            autoscaling: {
                minReplicas: req.body.workerreplicasrange[0] || 0,
                maxReplicas: req.body.workerreplicasrange[1] || 0,
                targetCPUUtilizationPercentage: req.body.workertargetCPUUtilizationPercentage || 80,
                targetMemoryUtilizationPercentage: req.body.workertargetMemoryUtilizationPercentage || 0
            }
        },
        cronjobs: req.body.cronjobs,
        addons: req.body.addons,
        resources: req.body.podsize.resources,
    };

    let app = new App(appconfig);
    
    req.app.locals.kubero.updateApp(app, req.body.resourceVersion);

    res.send("updated");
});

// get app details
Router.get('/pipelines/:pipeline/:phase/:app', async function (req: Request, res: Response) {
    let app = await req.app.locals.kubero.getApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send(app.body); 
});

// get all apps in a pipeline
Router.get('/pipelines/:pipeline/apps', async function (req: Request, res: Response) {
    let apps = await req.app.locals.kubero.getPipelineWithApps(req.params.pipeline);
    res.send(apps);
});

//restart app
Router.get('/pipelines/:pipeline/:phase/:app/restart', async function (req: Request, res: Response) {
    req.app.locals.kubero.restartApp(req.params.pipeline, req.params.phase, req.params.app);
    res.send("restarted"); 
});

// connect pipeline with github
Router.post('/repo/:repoprovider/connect', async function (req: Request, res: Response) {
    let con = await req.app.locals.kubero.connectRepo(req.params.repoprovider, req.body.gitrepo);
    res.send(con);
});

// connect pipeline with github
Router.get('/apps', async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getAppStateList());
});

// get github webhook events
Router.post('/repo/webhooks/:repoprovider', async function (req: Request, res: Response) {

    let ret: string = 'ok';
    switch (req.params.repoprovider){ 
        case "github":
            let github_event = req.headers['x-github-event']
            let github_delivery = req.headers['x-github-delivery']
            //let hookId = req.headers['x-github-hook-id']
            let github_signature = req.headers['x-hub-signature-256']
            let github_body = req.body

            //req.app.locals.kubero.handleGithubWebhook(github_event, github_delivery, github_signature, github_body);
            req.app.locals.kubero.handleWebhook('github', github_event, github_delivery, github_signature, github_body);
            break;
        case "gitea":
            //console.log(req.headers)
            let gitea_event = req.headers['x-gitea-event']
            let gitea_delivery = req.headers['x-gitea-delivery']
            //let hookId = req.headers['x-github-hook-id']
            let gitea_signature = req.headers['x-hub-signature-256']
            let gitea_body = req.body

            req.app.locals.kubero.handleWebhook('gitea', gitea_event, gitea_delivery, gitea_signature, gitea_body);
            break;
        case "gitlab":
            //req.app.locals.kubero.handleGitlabWebhook(req.body);
            ret = "gitlab not supported yet";
            break;
        case "bitbucket":
            //req.app.locals.kubero.handleBitbucketWebhook(req.body);
            ret = "bitbucket not supported yet";
            break;
        default:
            ret = "unknown repoprovider "+req.params.repoprovider;
            break;
    }
    res.send(ret);
});

// get a list of addons
Router.get('/addons', async function (req: Request, res: Response) {
    //res.send('ok');
    let addonslist = await req.app.locals.addons.getAddonsList();
    res.send(addonslist)
});

// delete an addon
Router.delete('/addons/:pipeline/:phase/:addonID', async function (req: Request, res: Response) {
    let addon = {
        group: req.body.apiVersion.split('/')[0],
        version: req.body.apiVersion.split('/')[1],
        namespace: req.params.pipeline + "-" + req.params.phase,
        pipeline: req.params.pipeline,
        phase: req.params.phase,
        plural: req.body.plural,
        id: req.params.addonID
    } as IAddonMinimal;
    await req.app.locals.addons.deleteAddon(addon);
    res.send('ok');
});

Router.get('/config', async function (req: Request, res: Response) {
    let debug: any = {};
    debug['pipelineState'] = req.app.locals.kubero.getPipelineStateList();
    debug['appStateList'] = await req.app.locals.kubero.getAppStateList();
    res.send(debug);
});

Router.get('/config/podsize', async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getPodSizeList());
});

Router.get('/config/k8s/context',  async function (req: Request, res: Response) {
    res.send(req.app.locals.kubero.getContexts());
});

Router.get('/logs/:pipeline/:phase/:app',  async function (req: Request, res: Response) {
    req.app.locals.kubero.startLogging(
        req.params.pipeline,
        req.params.phase,
        req.params.app
    );
    res.send('ok');
});

Router.get('/config/repositories', async function (req: Request, res: Response) {
    res.send(await req.app.locals.kubero.getRepositories());
});