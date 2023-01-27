import * as React from 'react';
import { IAssetReport, IWorkOrderReport, IContractLineItemReport } from "../../models/api/coreApi";
import { IAccountReportPayload } from "../../models/api/reports/accountReportApi";
import { IColumnHeaderAppearance, th } from "../table/Table";
import { CellValue, JsxElementWrapper } from "../table/TableCompact";
import { SalesForceLinkWrapper, hashLink } from "../forms/SalesForceLink";
import AccountInfo from "../../models/reports/AccountReport/AccountInfo";
import Contract from "../../models/reports/AccountReport/Contract";
import { formatDate, formatCurrency } from "../../utils/formatUtils";
import CustomerVisit from "../../models/reports/AccountReport/CustomerVisit";
import Note from "../../models/reports/AccountReport/Note";
import Survey from "../../models/reports/AccountReport/Survey";
import Complaint from "../../models/reports/AccountReport/Complaint";
import Query from "../../models/reports/AccountReport/Query";
import Invoice from "../../models/reports/AccountReport/Invoice";
import Equipment from "../../models/reports/AccountReport/Equipment";
import Opportunity from "../../models/reports/AccountReport/Opportunity";
import Lead from "../../models/reports/AccountReport/Lead";
import Tender from "../../models/reports/AccountReport/Tender";
import Technician from "../../models/reports/AccountReport/Technician";
import translate from "../../utils/translate";
import { conditions } from "src/actions/http/jsforceMappings";
import { groupBy } from 'lodash';
import { maintenanceActivityTypeFilterDescription } from 'src/constants/ServiceOrderType';
import TransactionalSurvey from 'src/models/reports/AccountReport/TransactionalSurvey';

const salesForceLink = (label: string, identity: { id: string }) => {
    return new JsxElementWrapper(label, <SalesForceLinkWrapper target={identity}>{label}</SalesForceLinkWrapper>)
}

function wrapArray<T, U>(array: T[], WrapperClass: new (t: T) => U) {
    return array == null ? [] as U[] : array.map(t => new WrapperClass(t));
}

export interface TableDefinition<T> {
    title: string,
    thPrefix: string,
    ths: IColumnHeaderAppearance[],
    rows: T[],
    row: (t: T) => CellValue[]
}

export enum ReportColor {
    green = 'green',
    yellow = 'yellow',
    orange = 'orange',
    red = 'red'
}

function calculateColor(val: number) {
    if (val < 2) return ReportColor.green;
    if (val < 4) return ReportColor.yellow;
    if (val < 6) return ReportColor.orange;
    return ReportColor.red;
}

export default function(report: IAccountReportPayload, locale: string) {
    const contractLineItemsByAssetId = groupBy(report.equipmentContractLines, 'AssetId')
    console.log(">>> contractLineItemsByAssetId", contractLineItemsByAssetId);

    return {
        accountInformation: {
            title: "account-report.sections.account-information" ,
            thPrefix: "account-report.sections",
            ths: [
                { width: 2, label: 'account-information', isBig: true },
                { width: 2, isVirtual: true },
                { width: 2, isVirtual: true },
                { width: 2, label: 'account-owner', borderLeft: true, isBig: true },
                { width: 2, isVirtual: true }
            ],
            
            status: report.accountsStatus, 
            rows: wrapArray(report.accounts, AccountInfo),
            row: (r: AccountInfo) => [salesForceLink(r.accountName, r), r.phone, r.address, r.accountOwner, r.accountPhone]
        },

        contracts: {
            title: "account-report.sections.contracts",
            thPrefix: "contract.field", 
            ths: [
                th(1, 'end-date'), th(1, 'number'), th(1, 'type'), th(1, 'number-of-equipment'), th(2, 'building-manager-contact'), th(1, 'risk-score'), th(1, 'risk-score-date'), th(3, 'risk-score-reason'), th(1, 'risk-profit-verbatim')
            ],
            status: report.contractsStatus, 
            rows: wrapArray(report.contracts, Contract),
            row: (r: Contract) => [
                formatDate(r.endDate, locale), salesForceLink(r.name, r), r.type, r.numberOfEquipment, r.buildingManagerContactName, r.riskScore, r.riskScoreDate, r.riskScoreReason, r.riskProfitVerbatim
            ]
        },

        customerVisits: {
            title: "account-report.sections.customer-visits",
            thPrefix: "account-report.customer-visits",
            ths: [
                th(2, 'date'), th(2, 'visitor'), th(2, 'customer-contact'), th(6, 'subject')
            ],
            status: report.customerVisitsStatus,
            rows: wrapArray(report.customerVisits, CustomerVisit),
            row: (r: CustomerVisit) => [
                salesForceLink(formatDate(r.startDate, locale), r), salesForceLink(r.owner.name, r.owner), r.who.name == null ? "" : salesForceLink(r.who.name, r.who), r.subject
            ]
        },

        notes: {
            title: "account-report.sections.notes",
            thPrefix: "",
            ths: [
                th(4, 'account-report.queries.subject'), th(6, 'account-report.notes.content'), th(2, 'generic.field.date')
            ],
            status: report.notesStatus,
            rows: wrapArray(report.notes, Note),
            row: (r: Note) => [r.subject, r.content, r.createDate]
        },

        surveys: {
            title: "account-report.sections.surveys",
            thPrefix: "account-report.surveys", 
            ths: [
                th(2, 'modification-date'), th(2, 'survey-name'), th(2, 'generic.field.type'), th(2, 'contact'), th(2, 'npi-score')
            ],
            status: report.customerSurveysStatus,
            rows: wrapArray(report.customerSurveys, Survey),
            row: (a: Survey) => [
                formatDate(a.modificationDate, locale), salesForceLink(a.name, a), a.type, a.contact, a.npiScore
            ]
        },

        transactionalSurveys: {
            title: "account-report.sections.transactional-surveys",
            thPrefix: "account-report.transactional-surveys", 
            ths: [
                th(2, 'response-received-date'), th(2, 'name'), th(2, 'survey-name'), th(2, 'contact'), th(2, 'npi-score'), th(2, 'npi-verbatim')
            ],
            status: report.transactionalSurveysStatus,
            rows: wrapArray(report.transactionalSurveys, TransactionalSurvey),
            row: (a: TransactionalSurvey) => [
                formatDate(a.responseReceivedDate, locale), salesForceLink(a.name, a), a.surveyName, a.contact, a.npi, a.npiVerbatim
            ]
        },

        complaints: {
            title: "account-report.sections.complaints",
            thPrefix: "account-report.complaints",
            ths: [
                th(2, 'date'), th(2, 'number'), th(4, 'subject'), th(2, 'reason'), th(2, 'type')
            ],
            status: report.complaintsStatus,
            rows: wrapArray(report.complaints, Complaint),
            row: (r: Complaint) => [
                formatDate(r.complaintDate, locale), salesForceLink(r.number, r), r.subject, r.reason, r.type
            ]
        },

        queries: {
            title: "account-report.sections.queries",
            thPrefix: "account-report.queries",
            ths: [
                th(2, 'date'), th(2, 'number'), th(4, 'subject'), th(2, 'category'), th(2, 'reason')
            ], 
            status: report.queriesStatus,
            rows: wrapArray(report.queries, Query),
            row: (r: Query) => [
                formatDate(r.queryDate, locale), salesForceLink(r.number, r), r.subject, r.category, r.reason
            ]
        },
        
        invoices: {
            title: "account-report.sections.unpaid-invoices", 
            thPrefix: "account-report.invoices",
            ths: [
                th(2, 'contract.field.number'), th(2, 'number'), th(2, 'date'), th(2, 'generic.field.due-date'), th(2, 'customer-po'), th(2, 'document-type'),
                th(2, 'account-report.opportunities.amount')
            ],
            status: report.unpaidInvoicesStatus, 
            rows: wrapArray(report.unpaidInvoices, Invoice),
            row: (r: Invoice) => [
                r.contractNumber, salesForceLink(r.number, r), formatDate(r.date, locale), formatDate(r.dueDate, locale), 
                r.customerPO, r.documentType, formatCurrency(r.amount, r.defaultcurrencyIsoCode, locale)
            ]
        },

        equipment: {
            title: "account-report.sections.equipments", 
            thPrefix: "account-report.equipment",
            ths: [
                th(2, 'address'), th(1, 'number'), th(1, 'generic.field.type'), th(1, 'account-report.leads.status'), 
                // th(1, 'callouts'), 
                th(1,'customer.report-callouts.completed'),
                th(1,'customer.report-other.orders.completed'),
                // th(1, 'other-service-orders'), 
                // th(1, 'missed-visits'),
                th(1, 'open-mbms'), th(1, 'customer.report-other.open.orders'), 
                // th(1, 'service-time'), th(1, 'response-time'), 
                th(1, '')
            ], 
            status: report.equipmentsStatus, 
            rows: report.equipments.map(eq => {
                const activeclis = (contractLineItemsByAssetId[eq.Id] || []).filter(cl => conditions.ContractLineItem.active.isFullfilledBy(cl));
                return new Equipment(eq, activeclis[0])
            }),
            row: (r: Equipment) => [
                r.siteAddress, salesForceLink(r.equipmentNumber, r), r.type, 
                r.status, r.completedCallouts, r.otherCompletedServiceOrders,
                // r.missedVisits,
                r.openMBMs, r.openServiceOrders.length, 
                // r.contractServiceHours, r.contractResponseTime, 
                new JsxElementWrapper(translate('account-report.equipment.link'), hashLink(r.id, translate('account-report.equipment.link')))
            ],
            colgroup : [
                <col span={1}/>,<col span={1}/>,<col span={1}/>,<col span={1} className='data-table-bordered--right'/>,
                <col span={1}/>,<col span={1} className='data-table-bordered--right'/>,
                <col span={1}/>,<col span={1} className='data-table-bordered--right'/>,
                <col span={1}/>
            ]
        },

        opportunities: {
            title: "account-report.sections.opportunities",
            thPrefix: "account-report.opportunities", 
            ths: [
                th(2, 'number'), th(2, 'business-type'), th(1, 'amount'), th(2, 'name'), th(2, 'stage-name'), th(6, 'description')
            ], 
            status: report.opportunitiesStatus, 
            rows: wrapArray(report.opportunities, Opportunity), 
            row: (r: Opportunity) => [salesForceLink(r.number, r), r.businessType, formatCurrency(r.amount, r.defaultcurrencyIsoCode, locale), r.name, r.stageName, r.description]
        },

        leads: {
            title: "account-report.sections.leads", 
            thPrefix: "account-report.leads", 
            ths: [
                th(2, 'owner'), th(2, 'business-type'), th(2, 'stage'), th(2, 'status'), th(2, 'source'), th(2, 'description')
            ], 
            status: report.leadsStatus, 
            rows: wrapArray(report.leads, Lead), 
            row: (r: Lead) => [r.leadOwner, r.businessType, r.stage, r.status, r.source, r.description]
        },

        tenders: {
            title: "account-report.sections.tenders", 
            thPrefix: "account-report.tenders", 
            ths: [
                th(2, 'date'), th(2, 'number'), th(2, 'stage'), th(2, 'total-sales-price'), th(2, 'owner'), th(2, 'description')
            ], 
            status: report.tendersStatus,
            rows: wrapArray(report.tenders, Tender), 
            row: (r: Tender) => [
                formatDate(r.createdDate, locale), r.number, r.stage, formatCurrency(r.totalSalesPrice, r.defaultcurrencyIsoCode, locale), r.owner, r.description
            ]
        },

        technicians: {
            title: "account-report.sections.technicians", 
            thPrefix: "account-report.technicians",
            ths: [
                th(2, 'name'), th(2, 'generic.field.mobile-phone'), th(2, 'workcenter')
            ], 
            status: report.techniciansStatus, 
            rows: wrapArray(report.technicians, Technician), 
            row: (r: Technician) => [r.name, r.phoneNumber, r.workcenter]
        },

        equipmentInfo: (t: IAssetReport) => ({
            title: "account-report.sections.equipment-info", 
            thPrefix: "", 
            ths: [
                th(1, 'generic.field.equipment-number'), th(1, 'generic.field.equipment-serial-number'), th(1, 'equipment-details.field.equipment-type'), 
                th(2, 'generic.field.manufacturer'), th(1, 'account-report.leads.status'), 
                th(2, 'equipment-details.field.billed-to-account'), th(2, 'equipment-details.field.decided-by-account'), th(2, 'equipment-details.field.sold-to-account')
            ], 
            status: report.equipmentsStatus, 
            rows: [t], 
            row: (r: IAssetReport) => {
                const activeclis = (contractLineItemsByAssetId[t.Id] || []).filter(cl => conditions.ContractLineItem.active.isFullfilledBy(cl));
                const billTos = activeclis.filter(cli => cli.Bill_To__r != null);
                const decidedBys = activeclis.filter(cli => cli.Decided_By__r != null);
                const payers = activeclis.filter(cli => cli.Payer__r != null);
                return [
                    salesForceLink(r.Name, { id: r.Id }), r.Manufacturer_Serial_Number__c, translate('equipment-type.' + r.Equipment_Type__c), 
                    r.Manufacturer__c, r.Status, 
                    billTos.length > 0 ? billTos[0].Bill_To__r.Name : '',
                    decidedBys.length > 0 ? decidedBys[0].Decided_By__r.Name : '',
                    payers.length > 0 ? payers[0].Payer__r.Name : ''
                ]
            }
        }),

        equipmentCallouts: (t: IAssetReport) => ({
            title: "account-report.equipment.callouts",
            thPrefix: "", 
            ths: Object.keys(t.serviceOrdersHistogram).map(h => ({ width: 1, label: h, color: calculateColor(t.serviceOrdersHistogram[h]) })),
            status: report.equipmentsStatus, 
            rows: [Object.keys(t.serviceOrdersHistogram).map(h => t.serviceOrdersHistogram[h])],
            row: (r: number[]) => r
        }),

        equipmentServiceOrders: (t: IAssetReport,activeInFSM: boolean) => ({
            title: "generic.open",
            thPrefix: "", 
            ths: [
                th(2, 'generic.field.date'), th(2, 'account-report.equipment.number'), th(2, 'generic.field.type'), 
                th(3, 'generic.field.description'), th(4, 'generic.field.job-description')
            ], 
            status: report.equipmentsStatus, 
            rows: t.openServiceOrders, 
            row: (r: IWorkOrderReport) => [
                formatDate(r.StartDate, locale),
                ( activeInFSM ? salesForceLink(r.WorkOrderNumber, { id: r.Id }): salesForceLink(r.Service_Order_Number__c, { id: r.Id }) ),
                maintenanceActivityTypeFilterDescription(r.Maintenance_Activity_Type__c, r.Service_Order_Type__c),
                r.Description__c, r.Job_Description__c
            ]
        }),

        equipmentCompleted: (t: IAssetReport,activeInFSM: boolean) => ({
            title: "account-report.equipment.completed", 
            thPrefix: "", 
            ths: [
                th(2, 'generic.field.date'), th(2, 'account-report.equipment.number'), th(2, 'generic.field.type'), 
                th(3, 'generic.field.description'), th(4, 'generic.field.job-description')
            ], 
            status: report.equipmentsStatus, 
            rows: t.closedServiceOrders, 
            row: (r: IWorkOrderReport) => [
                formatDate(r.Completed_Date__c||r.EndDate, locale), (activeInFSM ? r.WorkOrderNumber : r.Service_Order_Number__c) ,
                maintenanceActivityTypeFilterDescription(r.Maintenance_Activity_Type__c, r.Service_Order_Type__c),
                r.Description__c, r.Job_Description__c
            ]
        })

    };
}