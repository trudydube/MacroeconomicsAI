import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LandingPageComponent } from './landing-page.component'; 
import { PolicyMakerDashboardComponent } from './policy-maker-dashboard.component';
import { PolicyRecommendationComponent } from './policy-recommendation.component';
import { ForecastComponent } from './forecast.component';
import { HistoricalDataComponent } from './historical-data.component';
import { EconomistDashboardComponent } from './economist-dashboard.component';
import { EconomistForecastComponent } from './economist-forecast.component';
import { HistoricalDataEconomistComponent } from './historical-data-economist.component';
import { ViewDataComponent } from './view-data.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { SystemConfigComponent } from './systemconfig.component';
import { ScriptEditorComponent } from './script-editor.component';
import { ScenarioAnalysisComponent } from './scenario-analysis.component';
import { AuthGuard } from './auth.guard';
import { ForecastScriptEditorComponent } from './forecast-script-editor.component';
import { HistoricalDataAdminComponent } from './historical-data-admin.component';
import { ScenarioEditorComponent } from './scenario-editor.component';
import { AdminPolicyRecComponent } from './admin-policy-rec.component';
import { AdminForecastComponent } from './admin-forecast.component';
import { AdminScenarioAnalysisComponent } from './admin-scenario-analysis.component';
import { DatasetEditorComponent } from './dataset-editor.component';
import { ReportsComponent } from './reports.component';
import { AdminReportsComponent } from './admin-reports.component';
import { EconomistReportsComponent } from './economist-report.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent},
    { path: 'policydashboard', component: PolicyMakerDashboardComponent, canActivate: [AuthGuard], data: { roles: ['PolicyMaker']}},
    { path: 'economistdashboard', component: EconomistDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Economist', 'Researcher']}},
    { path: 'admindashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'historicaldataadmin', component: HistoricalDataAdminComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'systemconfig', component: SystemConfigComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'scripteditor', component: ScriptEditorComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'scenarioeditor', component: ScenarioEditorComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'adminpolicyrec', component: AdminPolicyRecComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'adminforecast', component: AdminForecastComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'adminscenarioanalysis', component: AdminScenarioAnalysisComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'dataseteditor', component: DatasetEditorComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'adminreports', component: AdminReportsComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'scenarioanalysis', component: ScenarioAnalysisComponent, canActivate: [AuthGuard], data: { roles: ['PolicyMaker']}},
    { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard], data: { roles: ['PolicyMaker']}},
    { path: 'forecastscripteditor', component: ForecastScriptEditorComponent, canActivate: [AuthGuard], data: { roles: ['admin']}},
    { path: 'economistforecast', component: EconomistForecastComponent, canActivate: [AuthGuard], data: { roles: ['Economist', 'Researcher']}},
    { path: 'economistreport', component: EconomistReportsComponent, canActivate: [AuthGuard], data: { roles: ['Economist', 'Researcher']}},
    { path: 'policyrec', component: PolicyRecommendationComponent, canActivate: [AuthGuard], data: { roles: ['PolicyMaker']}},
    { path: 'forecast', component: ForecastComponent, canActivate: [AuthGuard], data: { roles: ['PolicyMaker']}},
    { path: 'historicaldata', component: HistoricalDataComponent, canActivate: [AuthGuard], data: { roles: ['PolicyMaker']}},
    { path: 'historicaldataeconomist', component: HistoricalDataEconomistComponent, canActivate: [AuthGuard], data: { roles: ['Economist', 'Researcher']}},
    { path: 'viewdata', component: ViewDataComponent}

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
