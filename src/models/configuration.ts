import { FitterLocation } from "./api/mapApi";

export enum Layout {
    OVERVIEW = 'overview',
    ACTIVITIES = 'activities'
}

export interface ISalesOrganizationConfigurationState {
    "content": {
        "layout"?: Layout,
        "complaintsActive": boolean,
        "queriesActive": boolean,
        "tendersActive": boolean,
        "opportunitiesActive": boolean,
        "leadsActive": boolean,
        "timesheetActive": boolean,
        "fieldAuditsActive": boolean,
        "helpdeskCasesActive": boolean,
        "monthlyDiscussionsActive": boolean,
        "repairsActive": boolean,
        "inspectionsActive": boolean,
        "serviceNeedsActive": boolean,
        "inspectionPointsActive": boolean,
        "rejectedWorkOrdersActive": boolean,
    },
    "actions": {
        "newEquipmentAssigned": Config,
        "newEntrapment": Config,
        "svWillManageFlag": Config,
        "highPriorityCallout": Config,
        "newComplaintAssigned": Config,
        "newTaskAssignedRelatedToAComplaint": Config,
        "customerPreparationReportGenerationFinished"?: Config,
        "technicianPanicAlarm": Config,
        "technicianSafetyAlert": Config,
        "sickLift": Config,
        "declinedSA": Config,
        "newStoppedEquipment": Config,
        "rejectedCallout": Config,
        "gamificationRewards"?: Config,
        "scheduleCustomerCall": Config,
        "technicalHelpdeskCase": Config,
        "onBoardingVisitForNewContract": Config & {
            "customerGroup"?: CutomerGroup[],
            "equipmentType"?: EquipmentType[],
            "marketSegment"?: marketSegment[]
        }
    },
    "fitterLocation": FitterLocation,
    "technicianInactivityLimitInDays": number,
    "unitOfMeasure": UnitOfMeasure
    "declinedNumber": number,
    "declinedDays": number,
    "links": Link[],
    "serviceResourceEnabledPlannerGroups": string[],
}

type UnitOfMeasure = "Imperial" | "Metric"

type Config = {
    "enabled"?: boolean,
    "taskAction"?: boolean,
    "pushAction"?: boolean,
    "toastAction"?: boolean
}

type CutomerGroup = "Core 1" | "Core 2" | "Core 3" | "Strategic";
type EquipmentType = "001" | "002" | "003" | "004" | "005" | "007" | "010" | "011" | "012" | "999" | "008" | "006";
type marketSegment = "RES" | "OFF" | "HOT" | "RET" | "AIR" | "PTR" | "IND" | "MED" | "LEE" | "AFH" | "MAR" | "MUL" | "VIL";

export type Link = {
    "url" : string,
    "title" : string,
    "description": string
}
