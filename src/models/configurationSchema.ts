//I generated the schema with a visual studio plugin from the configuration.ts interface
export const schema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "definitions": {
        "ISalesOrganizationConfigurationState": {
            "type": "object",
            "properties": {
                "content": {
                    "type": "object",
                    "properties": {
                        "layout": {
                            "$ref": "#/definitions/Layout"
                        },
                        "complaintsActive": {
                            "type": "boolean"
                        },
                        "queriesActive": {
                            "type": "boolean"
                        },
                        "tendersActive": {
                            "type": "boolean"
                        },
                        "opportunitiesActive": {
                            "type": "boolean"
                        },
                        "leadsActive": {
                            "type": "boolean"
                        },
                        "timesheetActive": {
                            "type": "boolean"
                        },
                        "fieldAuditsActive": {
                            "type": "boolean"
                        },
                        "helpdeskCasesActive": {
                            "type": "boolean"
                        },
                        "monthlyDiscussionsActive": {
                            "type": "boolean"
                        },
                        "repairsActive": {
                            "type": "boolean"
                        },
                        "inspectionsActive": {
                            "type": "boolean"
                        },
                        "serviceNeedsActive": {
                            "type": "boolean"
                        },
                        "inspectionPointsActive": {
                            "type": "boolean"
                        },
                        "rejectedWorkOrdersActive": {
                            "type": "boolean"
                        },
                        "salesLeadsActive": {
                            "type": "boolean"
                        }
                    },
                    "required": [
                        "complaintsActive",
                        "queriesActive",
                        "tendersActive",
                        "opportunitiesActive",
                        "leadsActive",
                        "timesheetActive",
                        "fieldAuditsActive",
                        "helpdeskCasesActive",
                        "monthlyDiscussionsActive",
                        "repairsActive",
                        "inspectionsActive",
                        "serviceNeedsActive",
                        "inspectionPointsActive",
                        "rejectedWorkOrdersActive"
                    ],
                    "additionalProperties": true
                },
                "actions": {
                    "type": "object",
                    "properties": {
                        "newEquipmentAssigned": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "newEntrapment": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "svWillManageFlag": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "highPriorityCallout": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "newComplaintAssigned": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "declinedSA": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": false
                        },
                        "newTaskAssignedRelatedToAComplaint": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "customerPreparationReportGenerationFinished": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "technicianPanicAlarm": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "technicianSafetyAlert": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "sickLift": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "newStoppedEquipment": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "rejectedCallout": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "gamificationRewards": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "scheduleCustomerCall": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": true
                        },
                        "technicalHelpdeskCase": {
                            "type": "object",
                            "properties": {
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            },
                            "additionalProperties": false
                        },
                        "onBoardingVisitForNewContract": {
                            "type": "object",
                            "additionalProperties": true,
                            "properties": {
                                "customerGroup": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": [
                                            "Core 1",
                                            "Core 2",
                                            "Core 3",
                                            "Strategic"
                                        ]
                                    }
                                },
                                "equipmentType": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": [
                                            "001",
                                            "002",
                                            "003",
                                            "004",
                                            "005",
                                            "007",
                                            "010",
                                            "011",
                                            "012",
                                            "999",
                                            "008",
                                            "006"
                                        ]
                                    }
                                },
                                "marketSegment": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": [
                                            "RES",
                                            "OFF",
                                            "HOT",
                                            "RET",
                                            "AIR",
                                            "PTR",
                                            "IND",
                                            "MED",
                                            "LEE",
                                            "AFH",
                                            "MAR",
                                            "MUL",
                                            "VIL"
                                        ]
                                    }
                                },
                                "enabled": {
                                    "type": "boolean"
                                },
                                "taskAction": {
                                    "type": "boolean"
                                },
                                "pushAction": {
                                    "type": "boolean"
                                },
                                "toastAction": {
                                    "type": "boolean"
                                }
                            }
                        }
                    },
                    "required": [
                        "newEquipmentAssigned",
                        "newEntrapment",
                        "svWillManageFlag",
                        "highPriorityCallout",
                        "newComplaintAssigned",
                        "newTaskAssignedRelatedToAComplaint",
                        "technicianPanicAlarm",
                        "technicianSafetyAlert",
                        "sickLift",
                        "newStoppedEquipment",
                        "rejectedCallout",
                        "scheduleCustomerCall",
                        "technicalHelpdeskCase",
                        "onBoardingVisitForNewContract"
                    ],
                    "additionalProperties": true
                },
                "fitterLocationEnabled": {
                    "type": "boolean"
                },
                "fitterLocation": {
                    "$ref": "#/definitions/FitterLocation"
                },
                "technicianInactivityLimitInDays": {
                    "type": "number"
                },
                "declinedNumber": {
                    "type": "number"
                },
                "declinedDays": {
                    "type": "number"
                },
                "unitOfMeasure": {
                    "type": "string",
                    "enum": [
                        "Imperial",
                        "Metric"
                    ]
                }
            },
            "required": [
                "content",
                "actions",
                "fitterLocationEnabled",
                "fitterLocation",
                "technicianInactivityLimitInDays",
                "unitOfMeasure"
            ],
            "additionalProperties": true
        },
        "Layout": {
            "type": "string",
            "enum": [
                "overview",
                "activities"
            ]
        },
        "FitterLocation": {
            "type": "string",
            "enum": [
                "SO",
                "GPS",
                "OFF"
            ]
        }
    },
    "$ref": "#/definitions/ISalesOrganizationConfigurationState"
}