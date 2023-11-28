import { ReactiveVar } from "meteor/reactive-var";
import { Annotations, Preferences, Assignments, Data, EDFFile } from "/collections";
import swal from "sweetalert2";

var Highcharts = require("highcharts/highstock");
require("highcharts-annotations")(Highcharts);
require("highcharts-boost")(Highcharts);


$.widget("crowdeeg.TimeSeriesAnnotator", {
  // initial options when the widget is created
  options: {
    optionsURLParameter: "annotatorOptions",
    projectUUID: undefined,
    requireConsent: false,
    trainingVideo: {
      forcePlay: false,
      blockInteraction: true,
      vimeoId: "169158678",
    },
    payment: 0.0,
    showConfirmationCode: false,
    confirmationCode: undefined,
    recordingName: undefined,
    allRecordings: undefined,
    defaultMontage: undefined,
    channelsDisplayed: [0, 1, 2, 3, 4, 6, 7],
    channelGains: undefined,
    targetSamplingRate: undefined,
    useHighPrecisionSampling: false,
    channelGainAdjustmentEnabled: false,
    showChannelGainAdjustmentButtons: false,
    showInputPanelContainer: true,
    setVisibilityStatusForInfoPanel: undefined,
    toggleInfoPanel: undefined,
    staticFrequencyFiltersByChannelType: {},
    staticFrequencyFiltersByDataModality: {},
    preClassification: {
      show: false,
      title: "Pre-Classification",
      source: {},
      uncertaintyInformation: {
        quantitative: {
          show: true,
        },
        argumentative: {
          show: false,
          noiseProbability: 0.0,
        },
      },
    },
    frequencyFilters: [
      {
        title: "Lowpass",
        type: "lowpass",
        options: [
          {
            name: "70 Hz",
            value: 70,
            default: true,
          },
          {
            name: "30 Hz",
            value: 30,
          },
          {
            name: "15 Hz",
            value: 15,
          },
          {
            name: "off",
            value: undefined,
          },
        ],
      },
      {
        title: "Highpass",
        type: "highpass",
        options: [
          {
            name: "10 Hz",
            value: 10,
          },
          {
            name: "3 Hz",
            value: 3,
          },
          {
            name: "1 Hz",
            value: 1,
          },
          {
            name: "0.5 Hz",
            value: 0.5,
            default: true,
          },
          {
            name: "off",
            value: undefined,
          },
        ],
      },
      {
        title: "Notch",
        type: "notch",
        options: [
          {
            name: "60 Hz",
            value: 60,
          },
          {
            name: "50 Hz",
            value: 50,
          },
          {
            name: "off",
            value: undefined,
            default: true,
          },
        ],
      },
    ],
    xAxisTimescales: [
      {
        title: "Timescale",
        options: [
          {
            name: "1 Sec/page",
            value: 1,
          },
          {
            name: "2 Sec/page",
            value: 2,
          },
          {
            name: "5 Sec/page",
            value: 5,
          },
          {
            name: "10 Sec/page",
            value: 10,
          },
          {
            name: "15 Sec/page",
            value: 15,
          },
          {
            name: "20 Sec/page",
            value: 20,
          },
          {
            name: "30 Sec/page",
            value: 30,
          },
          {
            name: "60 Sec/page",
            value: 60,
            default: true,
          },
          // below will lower the data sampling rates i.e. lower the resolution
          {
            name: "5 min/page",
            value: 300,
          },
          {
            name: "1 hour/page",
            value: 3600,
          },
          {
            name: "4 hours/page",
            value: 14400,
          },
          {
            name: "8 hours/page",
            value: 28800,
          },
        ],
      },
    ],
    timeSyncOptions: [
      {
        title: "Time Sync",
        options: [
          {
            name: "Off",
            value: undefined,
            default: true,
          },
          {
            name: "By Crosshair",
            value: "crosshair",
          },
          {
            name: "No Timelock",
            value: "notimelock",
          },
          {
            name: "Start of File (offset)",
            value: "offset",
          },
        ],
      },
    ],
    boxAnnotationUserSelection: [
      {
        title: "Box Annotations",
        options: [],
      },
    ],
    annotationType: [
      {
        title: "Annotation Type",
        options: [],
      },
    ],
    keyboardInputEnabled: true,
    isReadOnly: false,
    startTime: 0,
    visibleRegion: {
      start: undefined,
      end: undefined,
      showProgress: true,
      hitModeEnabled: true,
      training: {
        enabled: true,
        isTrainingOnly: false,
        numberOfInitialWindowsUsedForTraining: 0,
        windows: [],
      },
    },
    graph: {
      channelSpacing: 400,
      width: undefined,
      height: 600,
      marginTop: 10,
      marginBottom: 30,
      marginLeft: 90,
      marginRight: 30,
      backgroundColor: "#ffffff",
      lineWidth: 1.0,
      enableMouseTracking: false,
    },
    marginTop: null,
    marginBottom: null,
    windowSizeInSeconds: 30,
    windowJumpSizeFastForwardBackward: 1,
    preloadEntireRecording: false,
    numberOfForwardWindowsToPrefetch: 3,
    numberOfFastForwardWindowsToPrefetch: 3,
    numberOfBackwardWindowsToPrefetch: 3,
    numberOfFastBackwardWindowsToPrefetch: 3,
    relativeGainChangePerStep: 0.25,
    idleTimeThresholdSeconds: 300,
    experiment: {},
    showArtifactButtons: false,
    showSleepStageButtons: true,
    showNavigationButtons: true,
    showBackToLastActiveWindowButton: true,
    showBookmarkCurrentPageButton: true,
    showFastBackwardButton: true,
    showBackwardButton: true,
    showForwardButton: true,
    showFastForwardButton: true,
    showShortcuts: false,
    showLogoutButton: false,
    showAnnotationTime: false,
    showReferenceLines: true,
    showTimeLabels: true,
    showChannelNames: true,
    features: {
      examplesModeEnabled: false,
      examples: [],
      cheatSheetsEnabled: false,
      openCheatSheetOnPageLoad: true,
      scrollThroughExamplesAutomatically: true,
      scrollThroughExamplesSpeedInSeconds: 5,
      showUserAnnotations: true,
      showAllBoxAnnotations: "",
      order: ["sleep_spindle", "k_complex", "rem", "vertex_wave", "delta_wave"],
      options: {
        sleep_spindle: {
          name: "Spindle",
          annotation: {
            red: 86,
            green: 186,
            blue: 219,
            alpha: {
              min: 0.22,
              max: 0.45,
            },
          },
          answer: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: {
              min: 0.1,
              max: 0.25,
            },
          },
          training: {
            windows: [],
          },
        },
        k_complex: {
          name: "K-Complex",
          annotation: {
            red: 195,
            green: 123,
            blue: 225,
            alpha: {
              min: 0.18,
              max: 0.35,
            },
          },
          answer: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: {
              min: 0.1,
              max: 0.25,
            },
          },
          training: {
            windows: [],
          },
        },
        rem: {
          name: "REM",
          annotation: {
            red: 238,
            green: 75,
            blue: 38,
            alpha: {
              min: 0.18,
              max: 0.35,
            },
          },
          answer: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: {
              min: 0.1,
              max: 0.25,
            },
          },
          training: {
            windows: [],
          },
        },
        vertex_wave: {
          name: "Vertex Wave",
          annotation: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: {
              min: 0.18,
              max: 0.35,
            },
          },
          answer: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: {
              min: 0.1,
              max: 0.25,
            },
          },
          training: {
            windows: [],
          },
        },
        delta_wave: {
          name: "Delta Wave",
          annotation: {
            red: 20,
            green: 230,
            blue: 30,
            alpha: {
              min: 0.18,
              max: 0.35,
            },
          },
          answer: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: {
              min: 0.1,
              max: 0.25,
            },
          },
          training: {
            windows: [],
          },
        },
      },
    },
  },

  _create: function () {
    var that = this;
    //console.log("_create.that:", that);
    that._initializeVariables();
    // handles key events
    that._keyDownCallback = that._keyDownCallback.bind(that);

    // destroys the current charts and reloads them
    that._reinitChart = that._reinitChart.bind(that);

    $(that.element).addClass(that.vars.uniqueClass);
    that._fetchOptionsFromURLParameter();
    that._createHTMLContent();
    if (that.options.requireConsent) {
      that._showConsentForm();
    }
    if (that.options.trainingVideo.forcePlay) {
      that._forcePlayTrainingVideo();
    }
    that._setupHITMode();
    if (that.options.features.examplesModeEnabled) {
      that._setupExamplesMode();
      return;
    }
    if (that.options.experiment.running) {
      that._setupExperiment();
      that._setup();
    } else {
      var recordingNameFromGetParameter =
        that._getUrlParameter("recording_name");
      if (recordingNameFromGetParameter) {
        let id = Data.findOne({
          path: recordingNameFromGetParameter,
        })._id;
        that.options.allRecordings = [
          { _id: id, path: recordingNameFromGetParameter },
        ];
        console.log(
          "recordingNameFromGetParameter:",
          recordingNameFromGetParameter
        );
      }
      that._setup();
    }
  },

  _destroy: function () {
    var that = this;

    $(document).off("keydown", that._keyDownCallback);
    $(window).off("resize", that._reinitChart);
  },

  _initializeVariables: function () {
    // initializing variables for future usage by the functions
    var that = this;
    that.vars = {
      currentTimeDiff: 0,
      annotationClicks: {
        clickOne: null,
        clickTwo: null,
      },
      recordScalingFactors: true,
      recordPolarity: true,
      recordTranslation: true,
      translation: {},
      scalingFactors: {},
      polarity: {},
      uniqueClass: that._getUUID(),
      activeFeatureType: 0,
      chart: null,
      universalChangePointAnnotationsCache: [],
      activeAnnotations: [],
      annotationsLoaded: true,
      selectedChannelIndex: undefined,
      currentWindowData: null,
      currentWindowStart: 0,
      currentWindowStartReactive: new ReactiveVar(null),
      lastActiveWindowStart: null,
      forwardEnabled: undefined,
      fastForwardEnabled: undefined,
      backwardEnabled: undefined,
      fastBackwardEnabled: undefined,
      currentAnnotationTime: null,
      popUpActive: 0,
      setupOn: false,
      printedBox: false,
      channelTimeshift: {},
      timeSyncMode: "",
      crosshairMode: false,
      crosshairPosition: [],
      crosshair: undefined,
      recordingMetadata: {},
      recordingLengthInSeconds: 0,
      numberOfAnnotationsInCurrentWindow: 0,
      specifiedTrainingWindows: undefined,
      requiredName: "",
      valueOptions: 0,
      allChannels: undefined,
      currType: "",
      increaseOnce: 0,
      oldIndex: -1,
      xAxisScaleInSeconds: 60,
      currentTrainingWindowIndex: 0,
      cheatSheetOpenedBefore: false,
      scrollThroughExamplesIntervalId: undefined,
      frequencyFilters: JSON.parse(
        JSON.stringify(that.options.frequencyFilters)
      ),
      audioContextSampleRate: 32768,
      fullWindowLabels: {
        artifacts_none: "ARTIFACT",
        artifacts_light: "ARTIFACT",
        artifacts_medium: "ARTIFACT",
        artifacts_strong: "ARTIFACT",
        sleep_stage_wake: "SLEEP_STAGE",
        sleep_stage_n1: "SLEEP_STAGE",
        sleep_stage_n2: "SLEEP_STAGE",
        sleep_stage_n3: "SLEEP_STAGE",
        sleep_stage_rem: "SLEEP_STAGE",
        sleep_stage_unknown: "SLEEP_STAGE",
      },
      fullWindowLabelsToHumanReadable: {
        artifacts_none: "No artifacts",
        artifacts_light: "Light artifacts",
        artifacts_medium: "Medium artifacts",
        artifacts_strong: "Strong artifacts",
        sleep_stage_wake: "Wake",
        sleep_stage_n1: "N1 Sleep",
        sleep_stage_n2: "N2 Sleep",
        sleep_stage_n3: "N3 Sleep",
        sleep_stage_rem: "REM Sleep",
        sleep_stage_unknown: "Unknown",
      },
      windowsCache: {},
      // windowCache is an object, keeping track of data that is loaded in the background:
      //
      // {
      //     'window_identifier_key_1': undefined,   // <-- data for this window is not available, but can be requested
      //     'window_identifier_key_2': false,       // <-- this window does not contain valid data
      //     'window_identifier_key_3': {            // <-- data for this window has been requested, but not been returned so far
      //         request: jqXHRObject,
      //         data: undefined
      //     },
      //     'window_identifier_key_4': {            // <-- data for this window is available
      //         request: jqXHRObject,
      //         data: dataObject
      //     },
      // }
      annotationsCache: {},
      // annotationsCache is an object, keeping track of annotations loaded from the server:
      //
      // {
      //     'start_end_answer': undefined,          // <-- data for this window is not available, but can be requested
      //     'start_end_answer': {},                 // <-- data for this window has been requested already
      // }
      
      // annotationCrosshairPositions is used to draw annotation boxes using crosshairs across multiple pages 
      annotationCrosshairPositions: [],
      annotationCrosshairCurrPosition: undefined,
      // count the number of crosshairs currently displayed on the screen.
      // annotationCrosshairCount: 0,
      annotationCrosshairs: [],
      annotationMode: undefined,
      // For selection of annotations to be changed by the hot key
      selectedAnnotation: undefined,

      // A hash set of all the annotation ids in that have been rendered, used to prevent repeated rendering
      annotationIDSet: new Set(),
    };
    if (that._getMontages()) {
      that.vars.currentMontage =
        that.options.defaultMontage || that._getMontages()[0];
    }
    if (that.options.channelGains) {
      that.vars.channelGains = that.options.channelGains;
    } else {
      var montages = that._getMontages();
      if (montages) {
        that.vars.channelGains = {};
        montages.forEach(function (montage) {
          that.vars.channelGains[montage] = that
            ._getChannelsDisplayed(montage)
            .map(function () {
              return 1.0;
            });
        });
      } else {
        that.vars.channelGains = that._getChannelsDisplayed().map(function () {
          return 1.0;
        });
      }
    }
  },

  _shouldBeMergedDeeply: function (objectA) {
    if (!objectA) return false;
    if (typeof objectA == "number") return false;
    if (typeof objectA == "string") return false;
    if (typeof objectA == "boolean") return false;
    if (objectA instanceof Array) return false;
    return true;
  },

  _mergeObjectsDeeply: function (target) {
    var that = this;
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
      for (var prop in source) {
        if (
          that._shouldBeMergedDeeply(target[prop]) &&
          that._shouldBeMergedDeeply(source[prop])
        ) {
          target[prop] = that._mergeObjectsDeeply(target[prop], source[prop]);
        } else {
          target[prop] = source[prop];
        }
      }
    });
    return target;
  },

  _fetchOptionsFromURLParameter: function () {
    var that = this;
    if (!that.options.optionsURLParameter) return;
    var optionsStringFromURL = that._getUrlParameter(
      that.options.optionsURLParameter
    );
    if (!optionsStringFromURL) return;
    try {
      var optionsFromURL = JSON.parse(optionsStringFromURL);
      that._mergeObjectsDeeply(that.options, optionsFromURL);
    } catch (e) {
      //console.log('The following options string does not have valid JSON syntax:', optionsStringFromURL);
    }
  },

  _createHTMLContent: function () {
    var that = this;
    var content =
      //TODO: lines 645 to end of comment is hwere the N1 things are located
      ' \
            <div class="graph_container"> \
                <div class="graph"></div> \
                <div class="graph_control"> \
                    <div class="experiment_container container-fluid"> \
                        <div class="alert alert-danger" id="alignment-alert" style="display: none"></div>\
                        <div class="col-xs-12 col-sm-4"></div> \
                        <div class="hints_container col-xs-12 col-sm-4"></div> \
                        <div class="buttons_container col-xs-12 col-sm-4"></div> \
                    </div> \
                    <div class="button_container container-fluid"> \
                        <div class="feature_panel btn-group" role="group"> \
                        </div> \
                       <!-- <div class="artifact_panel epoch-classification-panel btn-group notransition" role="group"> \
                            <button type="button" class="btn btn-default no-transition artifact" data-annotation-type="artifacts_none">No Artifacts<div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition artifact" data-annotation-type="artifacts_light">Light Artifacts<div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition artifact" data-annotation-type="artifacts_medium">Medium Artifacts<div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition artifact" data-annotation-type="artifacts_strong">Strong Artifacts<div class="votes-info"></div></button> \
                        </div> \
                        <div class="sleep_stage_panel epoch-classification-panel btn-group" role="group"> \
                            <button type="button" class="btn btn-default no-transition grey lighten-1 sleep_stage" data-annotation-type="sleep_stage_wake"><span class="shortcut-key">W</span>AKE<span class="shortcut-key hidden">0</span><div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition grey lighten-1 sleep_stage" data-annotation-type="sleep_stage_n1">N<span class="shortcut-key">1</span><div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition grey lighten-1 sleep_stage" data-annotation-type="sleep_stage_n2">N<span class="shortcut-key">2</span><div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition grey lighten-1 sleep_stage" data-annotation-type="sleep_stage_n3">N<span class="shortcut-key">3</span><div class="votes-info"></div></button> \
                            <button type="button" class="btn btn-default no-transition grey lighten-1 sleep_stage" data-annotation-type="sleep_stage_rem"><span class="shortcut-key">R</span>EM<span class="shortcut-key hidden">5</span><div class="votes-info"></div></button> \
                        </div> --> \
                        <div class="adjustment_buttons btn-group" role="group""> \
                            <button type="button" class="btn btn-default gain-button gainUp" aria-label="Left Align"> \
                            <span class="fa fa-plus" aria-hidden="true"></span> \
                            </button> \
                            <button type="button" class="btn btn-default gain-button gainDown" aria-label="Left Align"> \
                            <span class="fa fa-minus" aria-hidden="true"></span> \
                            </button> \
                            <button type="button" class="btn btn-default gain-button gainReset" aria-label="Left Align"> \
                            <span aria-hidden="true">Reset</span> \
                            </button> \
                        </div> \
                        <div style="margin-bottom: 20px" class="montage_panel select_panel"></div> \
                        <div style="margin-bottom: 20px" class="annotation_type_select_panel"></div> \
                        <div style="margin-bottom: 20px" class="frequency_filter_panel"></div> \
                        <div style="margin-bottom: 20px" class="timescale_panel"></div> \
                        <div style="margin-bottom: 20px" class="timesync_panel"> \
                            <button type="button" class="btn btn-default timesync" disabled>Sync</button> \
                        </div> \
                        <div class="amplitude_adjustment_container"> \
                            <div class="amplitude_adjustment_panel">\
                                <p class=channel_name></p> \
								                <p class=time_sync></p> \
                                <button id="increase" type="button" class="btn btn-default amplitude_adjustment_button" disabled>+</button> \
                                <button id="decrease" type="button" class="btn btn-default amplitude_adjustment_button" disabled>-</button> \
                                <button id="default" type="button" class="btn btn-default amplitude_adjustment_button" disabled>RESET ALL</button> \
                                <form id="scaleform" class="form-horizontal">\
                                  <input type="text" class="form-control" id="scaleinput" placeholder="CUSTOM SCALE (%)" disabled>\
                                  <input type="submit" style="display: none" />\
                                </form>\
                                <button id="scaletoscreen" type="button" class="btn btn-default amplitude_adjustment_button" disabled>SCALE TO SCREEN</button> \
                                <button id="scalealltoscreen" type="button" class="btn btn-default amplitude_adjustment_button" disabled>SCALE  ALL TO SCREEN</button> \
                                <button id="reversepolarity" type="button" class="btn btn-default amplitude_adjustment_button" disabled>REVERSE POLARITY</button> \
                                <button id="moveup" type="button" class="btn btn-default amplitude_adjustment_button" disabled>&uarr;</button> \
                                <button id="movedown" type="button" class="btn btn-default amplitude_adjustment_button" disabled>&darr;</button> \
                            </div>\
                        </div> \
                        <div style="margin-bottom: 20px; margin-left: 20px; margin-right: 20px" class="io_panel"> \
                            <button type="button" class="btn btn-default fa fa-save" ></button>&nbsp\
                            <button type="button" class="btn btn-default fa fa-download" ></button>&nbsp\
                            <button type="button" class="btn btn-default fa fa-upload" ></button>&nbsp\
                            <input type="file" accept=".csv, .json" multiple id="File">\
                        </div> \
                        <div style="margin-bottom: 20px" class="navigation_panel"> \
                                <button type="button" class="btn btn-default bookmarkCurrentPage" disabled aria-label="Bookmark Current Page"> \
                                    <span class="fa fa-bookmark" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default backToLastActiveWindow" aria-label="Back to Last Active Window"> \
                                    <span class="fa fa-repeat" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default fastBackward" aria-label="Fast Backward"> \
                                    <span class="fa fa-fast-backward" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn red lighten-1 narrow-horizontal-padding jumpToLastDisagreementWindow" aria-label="Jump to Last Disagreement Window"> \
                                    <span class="fa fa-chevron-left" aria-hidden="true"></span> \
                                    <span class="fa fa-exclamation-circle" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default backward" aria-label="Backward"> \
                                    <span class="fa fa-step-backward" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default forward" aria-label="Forward"> \
                                    <span class="fa fa-step-forward" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default fastForward" aria-label="Fast Forward"> \
                                    <span class="fa fa-fast-forward" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn red lighten-1 narrow-horizontal-padding jumpToNextDisagreementWindow" aria-label="Jump to Next Disagreement Window"> \
                                    <span class="fa fa-exclamation-circle" aria-hidden="true"></span> \
                                    <span class="fa fa-chevron-right" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default keyboardShortcuts" data-html="true" data-container=".' +
                                that.vars.uniqueClass +
                                '" data-toggle="popover" data-placement="bottom" data-content="<p>Forward: Right Arrow, Page up, D</p> \
                                                                    <p>Backward: Left Arrow, Page Down, A</p> \
                                                                    <p>Skip 5 Min: Up/Down Arrows</p> \
                                                                    <p>Back to Last Annotation: R</p> \
                                                                    <p>Feature Classifications: Number Keys</p>"> \
                                    <span class="fa fa-th" aria-hidden="true"></span> \
                                </button> \
                                <button type="button" class="btn btn-default annotationTime" aria-label="Total Annotation Time"> \
                                    <span class="fa fa-clock-o" aria-hidden="true"></span> \
                                    <div class="annotation-time-container"></div> \
                                </button> \
                                <button class="mark-assignment-as-completed btn btn-default" data-bound-action="COMPLETE_ASSIGNMENT" style="display: none;"> \
                                    <span class="fa fa-check" aria-hidden="true"></span> \
                                </button> \
                        </div> \
                        <div class="progress pull-right"> \
                            <div class="determinate progress-bar progress-bar-success progress-bar-striped" role="progressbar" style="width: 0%"> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
                <div class="graph_footer"> \
                    <div class="container-fluid"> \
                        <div class="adjustment_buttons col-xs-4 right"> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        ';
    $(that.element).html(content);
  },

  _adaptContent: function () {
    var that = this;
    if (!that.options.showChannelGainAdjustmentButtons) {
      $(".adjustment_buttons").hide();
    }
    if (!that.options.showArtifactButtons) {
      $(".artifact_panel").hide();
    }
    if (!that.options.showSleepStageButtons) {
      $(".sleep_stage_panel").hide();
    }
    if (!that.options.showNavigationButtons) {
      $(".navigation_panel").hide();
    }
    if (!that.options.showBackToLastActiveWindowButton) {
      $(".backToLastActiveWindow").hide();
    }
    if (!that.options.showBookmarkCurrentPageButton) {
      $(".bookmarkCurrentPage").hide();
    }
    if (!that._isArbitrating()) {
      $(".jumpToLastDisagreementWindow").hide();
      $(".jumpToNextDisagreementWindow").hide();
    }
    if (!that.options.showFastBackwardButton) {
      $(".fastBackward").hide();
    }
    if (!that.options.showBackwardButton) {
      $(".backward").hide();
    }
    if (!that.options.showForwardButton) {
      $(".forward").hide();
    }
    if (!that.options.showFastForwardButton) {
      $(".fastForward").hide();
    }
    if (!that.options.showShortcuts) {
      $(".keyboardShortcuts").hide();
    }
    if (!that.options.showAnnotationTime) {
      $(".annotationTime").hide();
    }
    if (!that.options.showLogoutButton) {
      $(".logout").hide();
    }
    if (!that.options.showInputPanelContainer) {
      $(that.element)
        .parents(".annotator-edf")
        .find(".input-panel-container")
        .hide();
      // $(".mark-assignment-as-completed").show();
      $(".mark-assignment-as-completed").hide();

      that._updateMarkAssignmentAsCompletedButtonState();
    }
    if (!that._isHITModeEnabled()) {
      $(".progress").hide();
    }
    $(that.element).css({
      marginTop: that.options.marginTop,
      marginBottom: that.options.marginBottom,
    });
  },

  _updateMarkAssignmentAsCompletedButtonState: function () {
    var that = this;
    $(that.element)
      .find(".mark-assignment-as-completed")
      .prop(
        "disabled",
        !that.options.context.assignment.canBeMarkedAsCompleted({
          reactive: false,
        })
      );
  },

  _forcePlayTrainingVideo: function () {
    var that = this;
    var videoBox = bootbox.dialog({
      title: "<b>Training Video (PLEASE TURN UP YOUR SOUND VOLUME)</b>",
      onEscape: false,
      backdrop: false,
      closeButton: false,
      animate: true,
      message:
        '<div class="training-video"></div><div class="interaction-blocker"></div>',
      size: "large",
    });
    videoBox.appendTo(that.element);
    videoBox.css({
      backgroundColor: "rgba(0, 0, 0, 1)",
      zIndex: 999999,
    });
    if (that.options.trainingVideo.blockInteraction) {
      videoBox.find(".interaction-blocker").css({
        position: "fixed",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
      });
    }
    var videoContainer = videoBox.find(".training-video");
    var videoId = that.options.trainingVideo.vimeoId;
    var aspectRatio = 513 / 287;
    var width = Math.round(videoContainer.width());
    var height = Math.round(width / aspectRatio);
    var playerId = that._getUUID();
    $.getJSON(
      "http://www.vimeo.com/api/oembed.json?url=" +
        encodeURIComponent("http://vimeo.com/" + videoId) +
        "&title=0&byline=0&portrait=0&badge=0&loop=0&autoplay=1&width=" +
        width +
        "&height=" +
        height +
        "&api=1&player_id=" +
        playerId +
        "&callback=?",
      function (data) {
        var playerIFrame = $(data.html)
          .attr("id", playerId)
          .appendTo(videoContainer);
        var player = $f(playerIFrame[0]);
        player.addEvent("ready", function () {
          player.addEvent("finish", function () {
            videoBox.remove();
          });
        });
      }
    );
  },

  _showConsentForm: function () {
    var that = this;
    var confirmationCodeInfo = "";
    if (that.options.showConfirmationCode && that.options.confirmationCode) {
      confirmationCodeInfo =
        ". For the payment to be processed correctly you need to enter the confirmation code presented to you at the end of the task into the corresponding input field in the instructions panel on Mechanical Turk";
    }
    bootbox
      .dialog({
        onEscape: false,
        backdrop: false,
        closeButton: false,
        animate: true,
        title: "Information Consent",
        message:
          ' \
                <div class="text-left"> \
                You are invited to participate in a research study conducted by Mike Schaekermann under the supervision of Professor Edith Law of the University of Waterloo, Canada. The objectives of the research study are to develop a low cost crowdsourcing system for EEG analysis for use in the third world.<br><br> \
                If you decide to participate, you will be asked to complete a 20-30 minute online EEG analysis task, as described on the task listing. Participation in this study is voluntary. You may decline to answer any questions that you do not wish to answer and you can withdraw your participation at any time by closing this browser tab or window. You will be paid $' +
          that.options.payment.toFixed(2) +
          " upon completion of the task" +
          confirmationCodeInfo +
          ". Unfortunately we are unable to pay participants who do not complete the task. There are no known or anticipated risks from participating in this study.<br><br> \
                It is important for you to know that any information that you provide will be confidential. All of the data will be summarized and no individual could be identified from these summarized results. Furthermore, the web site is programmed to collect responses alone and will not collect any information that could potentially identify you (such as machine identifiers). The data collected from this study will be maintained on a password-protected computer database in a restricted access area of the university. As well, the data will be electronically archived after completion of the study and maintained for eight years and then erased.<br><br> \
                This survey uses Mechanical Turk which is a United States of America company. Consequently, USA authorities under provisions of the Patriot Act may access this survey data. If you prefer not to submit your data through Mechanical Turk, please do not participate.<br><br> \
                Note that the remuneration you receive may be taxable income. You are responsible for reporting this income for tax purposes. Should you have any questions about the study, please contact either Mike Schaekermann (mschaeke@uwaterloo.ca) or Edith Law (edith.law@uwaterloo.ca). Further, if you would like to receive a copy of the results of this study, please contact either investigator.<br><br> \
                I would like to assure you that this study has been reviewed and received ethics clearance through a University of Waterloo Research Ethics Committee. However, the final decision about participation is yours. Should you have any comments or concerns resulting about your participation in this study, please contact Dr. Maureen Nummelin in the Office of Research Ethics at 1-519-888-4567, Ext. 36005 or maureen.nummelin@uwaterloo.ca.<br><br> \
                </div> \
                ",
        buttons: {
          consent: {
            label: "I understand and accept the participant consent agreement",
            className: "btn-success",
          },
        },
      })
      .css({
        zIndex: 99999,
      })
      .appendTo(that.element);
  },

  _setVisibilityStatusForInfoPanel: function (isVisible) {
    var that = this;
    const setVisibilityStatus = that.options.setVisibilityStatusForInfoPanel;
    if (!setVisibilityStatus) return;
    setVisibilityStatus(isVisible);
  },

  _showInfoPanel: function () {
    var that = this;
    that._setVisibilityStatusForInfoPanel(true);
  },

  _hideInfoPanel: function () {
    var that = this;
    that._setVisibilityStatusForInfoPanel(false);
  },

  _toggleInfoPanel: function () {
    var that = this;
    const toggle = that.options.toggleInfoPanel;
    if (!toggle) return;
    toggle();
  },

  _isHITModeEnabled: function () {
    var that = this;
    return (
      that._isVisibleRegionDefined() &&
      that.options.visibleRegion.hitModeEnabled
    );
  },

  _isVisibleRegionDefined: function () {
    var that = this;
    return (
      that.options.visibleRegion.start !== undefined &&
      that.options.visibleRegion.end !== undefined
    );
  },

  _setupHITMode: function () {
    var that = this;
    if (!that._isHITModeEnabled()) return;

    that.options.showBackToLastActiveWindowButton = false;
    that.options.showBookmarkCurrentPageButton = false;
    that.options.showFastBackwardButton = false;
    that.options.showBackwardButton = false;
    that.options.showForwardButton = false;
    that.options.showFastForwardButton = false;
    that.options.showShortcuts = false;
    that.options.showAnnotationTime = false;

    $(that.element)
      .find(".graph_footer .middle")
      .append(
        ' \
            <button type="button" class="btn btn-default no-features submit-annotations" aria-label="No features">I do not see any features</button> \
            <button type="button" class="btn btn-default submit-features submit-annotations" aria-label="Submit features" disabled>Submit features</button> \
            <button type="button" class="btn btn-default next-window" aria-label="Next window" disabled><i class="fa fa-step-forward"></i></button> \
        '
      );

    $(that.element)
      .find(".submit-annotations")
      .click(function () {
        that._blockGraphInteraction();
        if (that._isCurrentWindowTrainingWindow()) {
          that._revealCorrectAnnotations();
        }
        // log this window as complete and
        // set bookmark to next window so that
        // on page load, the user cannot change
        // any annotations made before submitting
        that._saveUserEventWindowComplete();
        that._savePreferences({
          startTime:
            that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds,
        });
        $(that.element).find(".submit-annotations").prop("disabled", true);
        $(".next-window").prop("disabled", false);
      });

    $(that.element)
      .find(".next-window")
      .click(function () {
        $(".no-features").prop("disabled", false);
        $(".submit-features").prop("disabled", true);
        $(".next-window").prop("disabled", true);
        if (
          that._isCurrentWindowLastTrainingWindow() &&
          !that._isTrainingOnly()
        ) {
          bootbox
            .alert({
              closeButton: false,
              title: "End of the Training Phase",
              message:
                "You just completed the last window of the training phase. That means that, from now on, you will not be able to see the correct answer after submitting yours any longer. The examples panel below, however, will stay visible throughout the entire task. Hopefully, the training phase helped you learn more about the signal pattern we are looking for!",
              callback: function () {
                that._shiftChart(1);
                that._unblockGraphInteraction();
              },
            })
            .appendTo(that.element);
        } else {
          that._shiftChart(1);
          that._unblockGraphInteraction();
        }
      });

    that._fetchOptionsFromURLParameter();
  },

  _getCurrentWindowIndexInVisibleRegion: function () {
    var that = this;
    if (!that._isHITModeEnabled()) return;
    var windowIndex = Math.floor(
      (that.vars.currentWindowStart - that.options.visibleRegion.start) /
        that.vars.xAxisScaleInSeconds
    );
    return windowIndex;
  },

  _getNumberOfTrainingWindows: function () {
    var that = this;
    var training = that.options.visibleRegion.training;
    if (!that._isTrainingEnabled()) {
      return 0;
    }
    if (training.numberOfInitialWindowsUsedForTraining > 0) {
      return training.numberOfInitialWindowsUsedForTraining;
    }
    return that._getSpecifiedTrainingWindows().length;
  },

  _areTrainingWindowsSpecified: function () {
    var that = this;
    that._getSpecifiedTrainingWindows();
    return (
      that.vars.specifiedTrainingWindows !== undefined &&
      that.vars.specifiedTrainingWindows.length > 0
    );
  },

  _getCurrentTrainingWindow: function () {
    var that = this;
    if (!that._areTrainingWindowsSpecified()) {
      return;
    }
    var trainingWindows = that._getSpecifiedTrainingWindows();
    var currentIndex = that.vars.currentTrainingWindowIndex;
    if (currentIndex > trainingWindows.length - 1) {
      return;
    }
    var trainingWindow = trainingWindows[currentIndex];
    return trainingWindow;
  },

  _isCurrentWindowSpecifiedTrainingWindow: function () {
    var that = this;
    if (!that._areTrainingWindowsSpecified()) return false;
    return (
      that.vars.currentTrainingWindowIndex < that._getNumberOfTrainingWindows()
    );
  },

  _getSpecifiedTrainingWindows: function () {
    var that = this;
    if (that.vars.specifiedTrainingWindows) {
      return that.vars.specifiedTrainingWindows;
    }
    var training = that.options.visibleRegion.training;
    if (
      !that._isTrainingEnabled() ||
      training.numberOfInitialWindowsUsedForTraining > 0
    ) {
      return [];
    }
    if (training.windows && training.windows.length > 0) {
      that.vars.specifiedTrainingWindows = training.windows;
      return that.vars.specifiedTrainingWindows;
    }
    var windows = [];
    var featureOrder = that.options.features.order;
    var featureOptions = that.options.features.options;
    for (f = 0; f < featureOrder.length; ++f) {
      var feature = featureOrder[f];
      var featureTrainingWindows = featureOptions[feature].training.windows;
      if (featureTrainingWindows && featureTrainingWindows.length > 0) {
        windows.push.apply(windows, featureTrainingWindows);
      }
    }
    that.vars.specifiedTrainingWindows = windows;
    return that.vars.specifiedTrainingWindows;
  },

  _isTrainingEnabled: function () {
    var that = this;
    return (
      that._isHITModeEnabled() && that.options.visibleRegion.training.enabled
    );
  },

  _isTrainingOnly: function () {
    var that = this;
    return that.options.visibleRegion.training.isTrainingOnly;
  },

  _isCurrentWindowTrainingWindow: function () {
    var that = this;
    if (!that._isHITModeEnabled()) return false;
    return (
      that._getWindowIndexForTraining() <=
      that._getNumberOfTrainingWindows() - 1
    );
  },

  _isCurrentWindowFirstTrainingWindow: function () {
    var that = this;
    if (!that._isHITModeEnabled()) return false;
    return (
      that._getNumberOfTrainingWindows() > 0 &&
      that._getWindowIndexForTraining() === 0
    );
  },

  _isCurrentWindowLastTrainingWindow: function () {
    var that = this;
    if (!that._isHITModeEnabled()) return false;
    return (
      that._getWindowIndexForTraining() ==
      that._getNumberOfTrainingWindows() - 1
    );
  },

  _getWindowIndexForTraining: function () {
    var that = this;
    if (!that._isHITModeEnabled()) return false;
    if (that._areTrainingWindowsSpecified()) {
      return that.vars.currentTrainingWindowIndex;
    } else {
      return that._getCurrentWindowIndexInVisibleRegion();
    }
  },

  _revealCorrectAnnotations: function () {
    var that = this;
    that._getAnnotations(
      that.vars.currentWindowRecording,
      that.vars.currentWindowStart,
      that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds,
      true
    );
  },

  _setupExamplesMode: function () {
    var that = this;
    var examples = that.options.features.examples;

    if (!examples || examples.length == 0) {
      //console.log('There are no examples for this viewer.');
      return;
    }
    examples.sort(function (a, b) {
      return a.start - b.start;
    });
    var firstExample = examples[0];
    var recordingName = firstExample.recording;
    var channelsDisplayed = [
      firstExample.channels_displayed[firstExample.channels],
    ];
    let id = Data.findOne({ path: recordingName })._id;
    that.options.allRecordings = [{ _id: id, path: recordingName }];
    that.options.channelsDisplayed = channelsDisplayed;
    that.options.graph.height = 200;
    that.options.features.showUserAnnotations = false;
    that.options.features.order = [firstExample.type];
    that.options.isReadOnly = true;
    that.options.channelGainAdjustmentEnabled = true;
    that.options.showChannelGainAdjustmentButtons = true;
    that.options.keyboardInputEnabled = false;
    that.options.showArtifactButtons = false;
    that.options.showNavigationButtons = false;
    that.options.showReferenceLines = false;
    that.options.features.cheatSheetsEnabled = true;
    that.options.features.openCheatSheetOnPageLoad = true;
    that.options.showTimeLabels = true;
    that._fetchOptionsFromURLParameter();

    $(that.element)
      .find(".button_container")
      .prepend('<span class="examples-title pull-left">Examples for:</span>');
    $(that.element)
      .find(".button_container")
      .append(
        ' \
            <div class="examples_panel btn-group"> \
                <button type="button" class="btn btn-default open-cheat-sheet" aria-label="Open Cheat Sheet"> \
                    <span class="fa fa-info-circle" aria-hidden="true"></span> Open Cheat Sheet \
                </button> \
                <button type="button" class="btn btn-default previous-example" aria-label="Previous Example"> \
                    <span class="fa fa-chevron-left" aria-hidden="true"></span> \
                </button> \
                <button type="button" class="btn btn-default next-example" aria-label="Next Example"> \
                    <span class="fa fa-chevron-right" aria-hidden="true"></span> \
                </button> \
            </div> \
        '
      );

    if (!that.options.features.cheatSheetsEnabled) {
      $(".open-cheat-sheet").remove();
    } else {
      $(that.element)
        .find(".open-cheat-sheet")
        .click(function () {
          that._saveUserEvent("open_cheat_sheet", {
            feature: firstExample.type,
          });
          openCheatSheet();
        });
      if (that.options.features.openCheatSheetOnPageLoad) {
        $(that.element).hover(function () {
          if (that.vars.cheatSheetOpenedBefore) return;
          openCheatSheet();
        });
      }
      function openCheatSheet() {
        that.vars.cheatSheetOpenedBefore = true;
        bootbox
          .dialog({
            title: "<b>PLEASE READ CAREFULLY</b>",
            message:
              '<img style="width: 100%; height: auto;" src="https://s3.amazonaws.com/curio-media/crowdeeg/feature-cheat-sheets/' +
              firstExample.type +
              '.png">',
            buttons: {
              close: {
                label: "Close",
              },
            },
            size: "large",
          })
          .appendTo(that.element);
      }
    }

    that.vars.currentExampleIndex = 0;
    that.options.startTime = that._getWindowStartForTime(
      examples[that.vars.currentExampleIndex].start
    );

    $(that.element)
      .find(".next-example")
      .click(function () {
        that._saveUserEvent("view_example_window", {
          feature: firstExample.type,
          direction: "next",
        });
        that._clearScrollThroughExamplesInterval();
        that._showNextExample(1);
      });
    $(that.element)
      .find(".previous-example")
      .click(function () {
        that._saveUserEvent("view_example_window", {
          feature: firstExample.type,
          direction: "previous",
        });
        that._clearScrollThroughExamplesInterval();
        that._showNextExample(-1);
      });
    if (that.options.features.scrollThroughExamplesAutomatically) {
      $(that.element).hover(function () {
        if (that.vars.scrollThroughExamplesIntervalId !== undefined) return;
        that.vars.scrollThroughExamplesIntervalId = window.setInterval(
          function () {
            that._showNextExample(1);
          },
          that.options.features.scrollThroughExamplesSpeedInSeconds * 1000
        );
      });
    }

    var wrapper = $("<div>").addClass("well");
    $(that.element).children().wrap(wrapper);
    that.options.graph.backgroundColor = "none";

    that._setup();
  },

  _clearScrollThroughExamplesInterval: function () {
    var that = this;
    if (
      that.vars.scrollThroughExamplesIntervalId !== undefined &&
      that.vars.scrollThroughExamplesIntervalId !== false
    ) {
      window.clearInterval(that.vars.scrollThroughExamplesIntervalId);
      that.vars.scrollThroughExamplesIntervalId = false;
    }
  },

  _showNextExample: function (stepLength) {
    var that = this;
    do {
      that.vars.currentExampleIndex += stepLength;
      that.vars.currentExampleIndex %= that.options.features.examples.length;
      while (that.vars.currentExampleIndex < 0) {
        that.vars.currentExampleIndex += that.options.features.examples.length;
      }
      var example =
        that.options.features.examples[that.vars.currentExampleIndex];
      var nextWindowStart = that._getWindowStartForTime(example.start);
    } while (nextWindowStart == that.vars.currentWindowStart);
    that._switchToWindow(
      that.options.allRecordings,
      nextWindowStart,
      that.vars.xAxisScaleInSeconds
    );
  },

  _getMontages: function () {
    // get the name of all montages, which is defined in annotatorConfig under task collection
    var that = this;
    if (that.options.channelsDisplayed instanceof Array) {
      return;
    }
    return Object.keys(that.options.channelsDisplayed);
  },

  _getChannelsDisplayed: function (montage) {
    // return the channel to display given the montage name
    var that = this;

    if (that.options.channelsDisplayed instanceof Array) {
      return that.options.channelsDisplayed;
    }
    if (montage) {
      return that.options.channelsDisplayed[montage];
    }
    if (
      that.vars.currentMontage &&
      that.options.channelsDisplayed[that.vars.currentMontage]
    ) {
      return that.options.channelsDisplayed[that.vars.currentMontage];
    } else if (
      that.options.defaultMontage &&
      that.options.channelsDisplayed[that.options.defaultMontage]
    ) {
      return that.options.channelsDisplayed[that.options.defaultMontage];
    }
    return that.options.channelsDisplayed[that._getMontages()[0]];
  },

  _getChannelGains: function (montage) {
    // return the gain of each channel given the montage name
    var that = this;
    if (that.vars.channelGains instanceof Array) {
      return that.vars.channelGains;
    }
    if (montage) {
      return that.vars.channelGains[montage];
    }
    if (
      that.vars.currentMontage &&
      that.vars.channelGains[that.vars.currentMontage]
    ) {
      return that.vars.channelGains[that.vars.currentMontage];
    } else if (
      that.options.defaultMontage &&
      that.vars.channelGains[that.options.defaultMontage]
    ) {
      return that.vars.channelGains[that.options.defaultMontage];
    }
    return that.vars.channelGains[that._getMontages()[0]];
  },

  _getGainForChannelIndex: function (index, montage) {
    var that = this;
    return that._getChannelGains(montage)[index];
  },

  _getOffsetForChannelIndexPostScale: function (index) {
    var that = this;
    var offset =
      (that.vars.currentWindowData.channels.length - 1 - index) *
      that.options.graph.channelSpacing;
    return offset;
  },

  _getWindowStartForTime: function (time) {
    var that = this;
    var windowStart = Math.floor(time / that.vars.xAxisScaleInSeconds);
    windowStart *= that.vars.xAxisScaleInSeconds;
    return windowStart;
  },

  _setup: function () {
    var that = this;
    //console.log("_setup.that:", that);
    that._adaptContent();
    that._setupTimer();
    that._setupFeaturePanel();
    that._setupNavigationPanel();
    that._setupArtifactPanel();
    that._setupSleepStagePanel();
    that._setupTimeSyncPanel();
    that._setupIOPanel();
    that._setupTrainingPhase();
    that._setupArbitration();
    that
      ._getRecordingMetadata()
      .then(that._setupDownsampledRecording) // downsample the recording if loading for the first time
      .then(() => {
        if (that.options.preloadEntireRecording) {
          //console.log("preloadEntireRecording", that.options.preloadEntireRecording);
          that._preloadEntireRecording(function () {
            that._getUserStatus();
          });
        } else {
          that._getUserStatus();
        }
      })
      .catch((error) => console.error(error));
    
  },

  _getUrlParameter: function (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  },

  _getPreClassificationAnnotations: function (filter, callback) {
    var that = this;
    filter = filter || {};
    return that.options.context.assignment.preClassificationAnnotations(
      filter,
      { sort: { "value.position.start": 1 } }
    );
  },

  _setupExperiment: function () {
    var that = this;
    if (!that.options.experiment.running) return;
    var temporalContextHint;
    switch (that.options.experiment.current_condition.temporal_context) {
      case "continuous":
        temporalContextHint = "Continuous sequence of windows";
        break;
      case "shuffled":
        temporalContextHint = "Shuffled sequence of windows";
        break;
    }
    var hint = $("<h4>").html(temporalContextHint);
    $(that.element).find(".experiment_container .hints_container").append(hint);
  },

  _updateNavigationStatusForExperiment: function () {
    var that = this;
    if (!that.options.experiment.running) return;
    var currentWindowIndex =
      that.options.experiment.current_condition.current_window_index;
    var conditionWindows = that.options.experiment.current_condition.windows;
    var lastWindowIndex = conditionWindows.length - 1;
    var windowsRemaining = lastWindowIndex - currentWindowIndex;
    that._setForwardEnabledStatus(windowsRemaining >= 1);
    if (windowsRemaining < 1) {
      that._lastWindowReached();
    }
    var fastForwardEnabled = windowsRemaining >= that.options.windowJumpSizeFastForwardBackward;
    
    
    that._setFastForwardEnabledStatus(
      fastForwardEnabled
    );
    that._setBackwardEnabledStatus(currentWindowIndex >= 1);
    that._setFastBackwardEnabledStatus(
      currentWindowIndex >= that.options.windowJumpSizeFastForwardBackward
    );
    if (
      that.options.experiment.current_condition.temporal_context == "shuffled"
    ) {
      that._setFastForwardEnabledStatus(false);
      that._setFastBackwardEnabledStatus(false);
      $(".fastForward").hide();
      $(".fastBackward").hide();
    }
  },

  _setupTimer: function () {
    var that = this;
    that.vars.totalAnnotationTimeSeconds = 0;
    var preferences = {};
    if (that.options.context.preferences) {
      preferences = that.options.context.preferences.annotatorConfig;
    }
    if (preferences.totalAnnotationTimeSeconds) {
      that.vars.totalAnnotationTimeSeconds = parseFloat(
        preferences.totalAnnotationTimeSeconds
      );
    }
    that.vars.lastAnnotationTime = that._getCurrentServerTimeMilliSeconds();
    if (preferences.lastAnnotationTime) {
      that.vars.lastAnnotationTime = parseInt(preferences.lastAnnotationTime);
    }
    var timerContainer = $(".annotation-time-container");
    var timeContainer = $("<span>").addClass("time form-control");
    timerContainer.append(timeContainer);
    that.vars.annotationTimeContainer = timeContainer;
    that._setTotalAnnotationTimeSeconds(that.vars.totalAnnotationTimeSeconds);
  },

  _setTotalAnnotationTimeSeconds: function (timeSeconds) {
    var that = this;
    that.vars.totalAnnotationTimeSeconds = timeSeconds;
    if (!that.vars.annotationTimeContainer) {
      return;
    }
    that.vars.annotationTimeContainer
      .timer("remove")
      .timer({
        seconds: that.vars.totalAnnotationTimeSeconds,
        format: "%H:%M:%S",
      })
      .timer("pause");
  },

  _updateLastAnnotationTime: function () {
    var that = this;
    var currentTime = that._getCurrentServerTimeMilliSeconds();
    var timeDifferenceSeconds =
      (currentTime - that.vars.lastAnnotationTime) / 1000;
    that.vars.lastAnnotationTime = currentTime;
    var preferencesUpdates = {
      lastAnnotationTime: that.vars.lastAnnotationTime,
    };
    if (timeDifferenceSeconds <= that.options.idleTimeThresholdSeconds) {
      that.vars.totalAnnotationTimeSeconds += timeDifferenceSeconds;
      that._setTotalAnnotationTimeSeconds(that.vars.totalAnnotationTimeSeconds);
      preferencesUpdates.totalAnnotationTimeSeconds =
        that.vars.totalAnnotationTimeSeconds;
    }
    that.vars.lastActiveWindowStart = that.vars.currentWindowStart;
    that._savePreferences(preferencesUpdates);
  },

  _getCurrentServerTimeMilliSeconds: function () {
    var today = new Date();
    var serverOffset = -5;
    var date = new Date().getTime() + serverOffset * 3600 * 1000;
    return date;
  },

  _setupMontageSelector: function () {
    // montage selector should be removed if we are fixing channels to be displayed by its montage or alignment mode
    var that = this;
    if (!that._getMontages()) {
      return;
    }
    var selectContainer = $("<div><select></select></div>").appendTo(
      that.element.find(".montage_panel")
    );
    var select = selectContainer.find("select");
    that._getMontages().forEach(function (montage) {
      var selectedString = "";
      if (montage == that.vars.currentMontage) {
        selectedString = ' selected="selected"';
      }
      select.append(
        '<option value="' +
          montage +
          '"' +
          selectedString +
          ">" +
          montage +
          "</option>"
      );
    });
    select.material_select();
    //console.log("_setupMontageSelector before change");
    select.change(function () {
      //console.log("_setupMontageSelector onchange");
      that.vars.currentMontage = select.val();
      that._savePreferences({
        defaultMontage: that.vars.currentMontage,
      });
      that._reinitChart();
    });
    //console.log("Finish _setupMontageSelector function");
  },

  _setupFrequencyFilterSelector: function () {
    var that = this;
    var frequencyFilters = that.options.frequencyFilters || [];
    frequencyFilters.forEach((frequencyFilter, f) => {
      var filterSettings = frequencyFilter.options;
      if (!filterSettings) {
        return;
      }
      var selectContainer = $(
        '<div class="select_panel"><select></select></div>'
      ).appendTo(that.element.find(".frequency_filter_panel"));
      var select = selectContainer.find("select");

      filterSettings.forEach(function (filterSetting) {
        var selectedString = "";
        if (filterSetting.default) {
          selectedString = ' selected="selected"';
        }
        select.append(
          '<option value="' +
            filterSetting.value +
            '"' +
            selectedString +
            ">" +
            frequencyFilter.title +
            ": " +
            filterSetting.name +
            "</option>"
        );
      });
      select.material_select();
      select.change(function () {
        //console.log("freqFilter onchange");
        filterSettings.forEach(function (filterSetting) {
          delete filterSetting.default;
        });
        filterSettings[select.prop("selectedIndex")].default = true;
        that._savePreferences({
          frequencyFilters: frequencyFilters,
        });
        that.vars.frequencyFilters[f].selectedValue = select.val();
        that._reloadCurrentWindow();
        //console.log("freqFilter here");
      });
      select.change();
    });
  },

  _setupAnnotationDisplayType: function () {
    var that = this;
    //that.vars.printedBox = true;
    $(".frequency_filter_panel").after(
      $('<div style="margin-bottom: 20px" class="user_selection_panel"></div>')
    );
    that.options.boxAnnotationUserSelection[0].options = [];
    var temp = that.options.boxAnnotationUserSelection;
    temp[0].options.push(
      {
        name: "Off",
        value: "none",
        default: true,
      },
      {
        name: "Show My",
        value: "my",
      }
    );
    //Allow admins to see all annotations from differnt users, by adding them to dropdown
    if (Roles.userIsInRole(Meteor.userId(), "admin")) {
      temp[0].options.push({ name: "Show All", value: "all" });
      assign = Assignments.find(
        {
          task: that.options.context.task._id,
          // dataFiles: that.options.context.dataset.map((data) => data._id),
        },
        {
          sort: { updatedAt: -1 },
        }
      ).fetch();

      var users = assign[0].users;
      var userNames = Meteor.users
        .find({ _id: { $in: users } }, { username: 1, sort: { updatedAt: -1 } })
        .fetch()
        .map((u) => u.username);
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        var username = userNames[i];
        if (user == Meteor.userId()) {
          continue;
        }
        temp[0].options.push({ name: username, value: user });
      }
    }
    if (!that.vars.printedBox) {
      that.vars.printedBox = true;
      that.__setupAnnotationChoice();
    }
    var selection = that.options.boxAnnotationUserSelection || [];
    selection.forEach((boxAnnotation, t) => {
      var boxAnnotationSettings = boxAnnotation.options;
      var selectContainer = $(
        '<div class="select_panel"><select></select></div>'
      ).appendTo(that.element.find(".user_selection_panel"));
      var select = selectContainer.find("select");

      boxAnnotationSettings.forEach(function (boxAnnotationSetting) {
        var selectedString = "";
        if (boxAnnotationSetting.default) {
          selectedString = ' selected="selected"';
        }
        select.append(
          '<option value="' +
            boxAnnotationSetting.value +
            '"' +
            selectedString +
            ">" +
            boxAnnotation.title +
            ": " +
            boxAnnotationSetting.name +
            "</option>"
        );
        if (
          boxAnnotationSetting.value == "my" &&
          Roles.userIsInRole(Meteor.userId(), "admin")
        ) {
          select.append(
            '<optgroup id="otherUsers" label="Other Users"></optgroup>'
          );
        }
      });

      select.material_select();
      select.change(function () {
        that.options.features.showAllBoxAnnotations = select.val();
        that.vars.annotationsLoaded = false;
        that.vars.annotationsCache = [];

        that._removeAnnotationBox();

      });
      select.change();
    });
  },

  _setupAnnotationChoice: function () {
    var that = this;
    that.vars.printedBox = true;

    that.options.annotationType[0].options = [];
    var temp = that.options.annotationType;
    temp[0].options.push(
      {
        name: "Off",
        value: "none",
        default: true,
      },
      // {
      //   name: "Start & End Point Annotation (All)",
      //   value: "sne",
      // },
      {
        name: "Stage Change",
        value: "cpointall",
      },
      {
        name: "Event (Start & End Point)",
        value: "cpoint",
      },
      {
        name: "Event (Box)",
        value: "box",
      },
    );

    var selection = that.options.annotationType || [];
    selection.forEach((typeAnnotation, t) => {
      var typeAnnotationSettings = typeAnnotation.options;
      var selectContainer = $(
        '<div class="select_panel"><select></select></div>'
      ).appendTo(that.element.find(".annotation_type_select_panel"));

      var select = selectContainer.find("select");
      typeAnnotationSettings.forEach(function (typeAnnotationSetting) {
        var selectedString = "";
        if (typeAnnotationSetting.default) {
          selectedString = ' selected="selected"';
        }
        select.append(
          '<option value="' +
            typeAnnotationSetting.value +
            '"' +
            selectedString +
            ">" +
            typeAnnotation.title +
            ": " +
            typeAnnotationSetting.name +
            "</option>"
        );
      });

      select.material_select();
      // $(document).ready(function() {
      select.change(function () {
        that.options.features.annotationType = select.val();
        that._setupAnnotationInteraction();
      });
      // });
      select.change();
    });
  },

  _setupXAxisScaleSelector: function () {
    let that = this;
    let timescales = that.options.xAxisTimescales || [];
    timescales.forEach((timescaleSetting) => {
      let selectContainer = $(
        '<div class="select_panel"><select></select></div>'
      ).appendTo(that.element.find(".timescale_panel"));
      let select = selectContainer.find("select");

      let defaultOptionIndex = null;
      timescaleSetting.options.forEach((timescale, t) => {
        let selectedString = "";

        if (timescale.default) {
          selectedString = ' selected="selected"';
          defaultOptionIndex = t;
        }
        select.append(
          `<option value=${timescale.value}` +
            selectedString +
            ">" +
            timescaleSetting.title +
            ": " +
            timescale.name +
            "</option>"
        );
      });

      select.material_select();
      select.change(function () {
        //console.log("timescale onchange");
        if (defaultOptionIndex)
          delete timescaleSetting.options[defaultOptionIndex].default;
        timescaleSetting.options[select.prop("selectedIndex")].default = true;
        that.vars.xAxisScaleInSeconds = +select.val();
        that._reloadCurrentWindow();
        //console.log("timescale here");
      });
      select.change();
    });
  },

  _setupDownsampledRecording: function (that) {
    // downsample all recordings in the assignment to lower resolution (sampling rate) for future usage
    return new Promise((resolve, reject) => {
      Meteor.call(
        "setup.edf.downsampled",
        that.options.allRecordings,
        that.vars.recordingMetadata,
        (error, results) => {
          if (error) throw new Error("Cannot downsample EDF file\n" + error);
          else resolve();
        }
      );
    });
  },

  _setupFeaturePanel: function () {
    var that = this;
    $('[data-toggle="popover"]').popover({ trigger: "hover" });

    var firstFeature = that.options.features.order[0];
    that.vars.activeFeatureType = firstFeature;

    // for (var i = 0; i < that.options.features.order.length; i++) {
    // 	var feature_key = that.options.features.order[i];
    // 	var feature_name = that.options.features.options[feature_key].name;
    // 	var featureButton = $(
    // 		'<button type="button" class="btn feature ' +
    // 			feature_key +
    // 			'">' +
    // 			feature_name +
    // 			"</button>"
    // 	).data("annotation-type", feature_key);
    // 	$(".feature_panel").append(featureButton);
    // 	$(
    // 		'<style type="text/css">.feature.' +
    // 			feature_key +
    // 			", .feature." +
    // 			feature_key +
    // 			":hover { background-color: " +
    // 			that._getFeatureColor(feature_key, false, 0.05) +
    // 			"} .feature." +
    // 			feature_key +
    // 			".active { background-color: " +
    // 			that._getFeatureColor(feature_key) +
    // 			"}</style>"
    // 	).appendTo("head");
    // }
    $(that.element)
      .find(".feature")
      .click(function (event) {
        that._selectFeatureClass($(this));
      });
    $(that.element)
      .find(".feature." + firstFeature)
      .addClass("active")
      .siblings()
      .removeClass("active");
  },

  _preloadEntireRecording: function (callback) {
    var that = this;
    if (that._isArbitrating()) {
      callback();
      return;
    }
    var montages = that._getMontages();
    var channelsDisplayedPerMontage = [];
    if (montages) {
      montages.forEach(function (montage) {
        channelsDisplayedPerMontage.push(that._getChannelsDisplayed(montage));
      });
    } else {
      channelsDisplayedPerMontage = [that._getChannelsDisplayed()];
    }
    var recordingLengthInSeconds = that.vars.recordingLengthInSeconds;
    ////console.log(that.vars.recordingMetadata);
    // For local debugging, only
    // preload a maximum of 10 epochs
    if (!Meteor.isProduction) {
      recordingLengthInSeconds = Math.min(
        10 * that.vars.xAxisScaleInSeconds,
        recordingLengthInSeconds
      );
    }
    var numWindowsToRequestPerMontage = Math.ceil(
      recordingLengthInSeconds / that.vars.xAxisScaleInSeconds
    );
    var numWindowsToRequestTotal =
      numWindowsToRequestPerMontage * channelsDisplayedPerMontage.length;
    var numWindowsLoaded = 0;
    var progressBar = $(
      '<div class="progress"><div class="indicator determinate"></div></div>'
    ).appendTo(that.element.find(".graph_container"));
    var loadingCompleted = false;
    function updateLoadingProgress() {
      var percentage = Math.max(
        0,
        Math.min(
          100,
          Math.round((numWindowsLoaded / numWindowsToRequestTotal) * 100)
        )
      );
      progressBar.find(".indicator").css("width", percentage + "%");
      if (percentage >= 100 && !loadingCompleted) {
        loadingCompleted = true;
        setTimeout(() => {
          progressBar.remove();
          callback();
        }, 500);
      }
    }
    updateLoadingProgress();
    //console.log("channelsDisplayedPerMontage:", channelsDisplayedPerMontage);
    channelsDisplayedPerMontage.forEach(function (channelsDisplayed, m) {
      for (var i = 0; i < numWindowsToRequestPerMontage; ++i) {
        var startTime = i * that.vars.xAxisScaleInSeconds;
        var options = {
          recordings: that.options.allRecordings,
          channels_displayed: channelsDisplayed,
          start_time: i * that.vars.xAxisScaleInSeconds + 90,
          window_length: that.vars.xAxisScaleInSeconds,
          target_sampling_rate: that.options.targetSamplingRate,
          use_high_precision_sampling: that.options.useHighPrecisionSampling,
        };
        ////console.log(options);
        that._requestData(options, function (data, error) {
          if (error) {
            console.log(error);
          }
          ++numWindowsLoaded;
          updateLoadingProgress();
        });
      }
    });
  },

  _getRecordingMetadata: function () {
    // get the metadata and total length of the recording
    var that = this;
    return new Promise((resolve, reject) => {
      if (
        Object.keys(that.vars.recordingMetadata).length ===
        that.options.allRecordings.length
      ) {
        return resolve(that);
      }
      Meteor.call(
        "get.edf.metadata.and.length",
        that.options.allRecordings,
        (error, results) => {
          if (error) {
            throw new Error("Cannot get recording metadata\n" + error);
          }
          that.vars.recordingLengthInSeconds = results.lengthInSeconds;
          that.vars.recordingMetadata = results.allMetadata;
          return resolve(that);
        }
      );
    });
  },

  _triggerOnReadyEvent: function () {
    var that = this;
    $(that.element).parents(".assignment-container").trigger("readyToStart");
  },

  _getUserStatus: function () {
    var that = this;
    //console.log("_getUserStatus.that:", that);
    that._setupMontageSelector();
    //console.log("Finish _setupMontageSelector");
    that._setupFrequencyFilterSelector();
    //console.log("Finish _setupFrequencyFilterSelector");
    that._setupXAxisScaleSelector();
    //console.log("Finish _setupXAxisScaleSelector");
    that._setupAnnotationChoice();
    //console.log("Finish _setupAnnotationChoice");
    that._setupAnnotationDisplayType();
    //console.log("Finish _setupAnnotationDisplayType");

    //console.log("before ifs");
    if (that.options.experiment.running) {
      //console.log("that.options.experiment.running");
      that._updateNavigationStatusForExperiment();
      var currentWindowIndex =
        that.options.experiment.current_condition.current_window_index;
      var conditionWindows = that.options.experiment.current_condition.windows;
      let id = Data.findOne({
        path: that.options.experiment.current_condition.recording_name,
      })._id;
      that.options.allRecordings = [
        {
          _id: id,
          path: that.options.experiment.current_condition.recording_name,
        },
      ];
      var initialWindowStart = conditionWindows[currentWindowIndex];
      that.vars.lastActiveWindowStart = initialWindowStart;
      that._switchToWindow(
        that.options.allRecordings,
        initialWindowStart,
        that.vars.xAxisScaleInSeconds
      );
    } else if (that._areTrainingWindowsSpecified()) {
      //console.log("that._areTrainingWindowsSpecified")
      var trainingWindow = that._getCurrentTrainingWindow();
      let id = Data.findOne({ path: trainingWindow.recordingName })._id;
      trainingWindow.recordingName = [
        { _id: id, path: trainingWindow.recordingName },
      ];
      that._switchToWindow(
        trainingWindow.recordingName,
        trainingWindow.timeStart,
        trainingWindow.windowSizeInSeconds
      );
    } else if (that.options.allRecordings.length > 0) {
      //console.log("that.options.allRecordings")
      that._loadChannelTimeshiftFromPreference();
      that.vars.lastActiveWindowStart = +that.options.startTime;
      const context = that.options.context;
      const preferencesArbitrationRoundNumber = !!context.preferences
        .arbitrationRoundNumber
        ? context.preferences.arbitrationRoundNumber
        : 0;
      if (
        that._isArbitrating() &&
        preferencesArbitrationRoundNumber < that._getArbitrationRoundNumberInt()
      ) {
        that.vars.currentWindowStart = 0;
        that.vars.lastActiveWindowStart =
          that._getClosestDisagreementWindowStartTimeInSeconds(1);
        if (that.vars.lastActiveWindowStart === false) {
          that.vars.lastActiveWindowStart = that.options.startTime;
        }
      }
      that._switchToWindow(
        that.options.allRecordings,
        that.vars.lastActiveWindowStart,
        that.vars.xAxisScaleInSeconds
      );
    } else {
      alert("Could not retrieve user data.");
      return;
    }
    // that._triggerOnReadyEvent();
    // $(window).resize(that._reinitChart);
  },

  _setupArtifactPanel: function () {
    var activeClass = "teal darken-4";
    var that = this;
    $(that.element)
      .find(".artifact_panel button.artifact")
      .click(function () {
        var button = $(this);
        var type = button.data("annotation-type");
        that._saveArtifactAnnotation(type);
        button.addClass(activeClass).siblings().removeClass(activeClass);
      });
  },

  _setupSleepStagePanel: function () {
    // //console.log("inside sleep");
    var inactiveClass = "grey lighten-1";
    var activeClassSelectedInPreviousRound =
      "selected-in-previous-round " + inactiveClass;
    var activeClassSelectedInCurrentRound = "teal";
    var activeClasses =
      activeClassSelectedInPreviousRound +
      " " +
      activeClassSelectedInCurrentRound;
    var that = this;
    $(that.element)
      .find(".sleep_stage_panel button.sleep_stage")
      .click(function () {
        // //console.log("clicked");

        var button = $(this);
        var type = button.data("annotation-type");
        button
          .removeClass(inactiveClass)
          .addClass(activeClassSelectedInCurrentRound)
          .siblings()
          .removeClass(activeClasses)
          .addClass(inactiveClass);

        that.vars.currType = type;
        that._setupAnnotationInteraction();
        that._saveSleepStageAnnotation(type);
      });
  },

  _setupNavigationPanel: function () {
    var that = this;
    that._setJumpToLastDisagreementWindowEnabledStatus(false);
    that._setJumpToNextDisagreementWindowEnabledStatus(false);
    that._setForwardEnabledStatus(false);
    that._setFastForwardEnabledStatus(false);
    that._setBackwardEnabledStatus(false);
    that._setFastBackwardEnabledStatus(false);

    if (that.options.showBackToLastActiveWindowButton) {
      $(that.element)
        .find(".backToLastActiveWindow")
        .click(function () {
          that._switchBackToLastActiveWindow();
        });
    }
    if (that.options.showBookmarkCurrentPageButton) {
      $(that.element)
        .find(".bookmarkCurrentPage")
        .click(function () {
          that._toggleBookmarkCurrentPage();
        });
    }
    if (that._isArbitrating()) {
      $(that.element)
        .find(".jumpToLastDisagreementWindow")
        .click(function () {
          that._jumpToClosestDisagreementWindow(-1);
        });
      $(that.element)
        .find(".jumpToNextDisagreementWindow")
        .click(function () {
          that._jumpToClosestDisagreementWindow(1);
        });
    }
    if (that.options.showForwardButton) {
      $(that.element)
        .find(".forward")
        .click(function () {
          that._shiftChart(1/5);
        });
    }
    if (that.options.showBackwardButton) {
      $(that.element)
        .find(".backward")
        .click(function () {
          that._shiftChart(-1/5);
        });
    }
    if (that.options.showFastForwardButton) {
      $(that.element)
        .find(".fastForward")
        .click(function () {
          that._shiftChart(that.options.windowJumpSizeFastForwardBackward);
        });
    }
    if (that.options.showFastBackwardButton) {
      $(that.element)
        .find(".fastBackward")
        .click(function () {
          that._shiftChart(-that.options.windowJumpSizeFastForwardBackward);
        });
    }
    $(that.element)
      .find(".gainUp")
      .click(function () {
        that._updateChannelGain("step_increase");
      });
    $(that.element)
      .find(".gainDown")
      .click(function () {
        that._updateChannelGain("step_decrease");
      });
    $(that.element)
      .find(".gainReset")
      .click(function () {
        that._updateChannelGain("reset");
      });
    if (that.options.keyboardInputEnabled) {
      // setup arrow key navigation
      $(document).on("keydown", that._keyDownCallback);
    }
  },

  _destroyCrosshair: function () {
    var that = this;
    if (that.vars.crosshair) {
      that.vars.crosshair.destroy();
      that.vars.crosshair = undefined;
    }
    return;
  },

  _isInCrosshairSyncMode: function () {
    var that = this;
    return that.vars.timeSyncMode === "crosshair";
  },

  _isInOffsetSyncMode: function () {
    var that = this;
    return that.vars.timeSyncMode === "offset";
  },

  _isInNoTimelockMode: function () {
    var that = this;
    return that.vars.timeSyncMode === "notimelock";
  },

  _toggleNoTimelockScroll: function (toggle) {
    var that = this;
    var chart = that.vars.chart;

    function scroll(e) {
      let dist = e.deltaY * 0.025;
      let channelIndex = that.vars.selectedChannelIndex;
      if (channelIndex !== undefined) {
        let modifiedDataId = chart.series[channelIndex].options.custom.dataId;
        let timeshift = that.vars.channelTimeshift[modifiedDataId];
        timeshift = timeshift ? timeshift + dist : dist;
        let recordingLength =
          that.vars.recordingMetadata[modifiedDataId].LengthInSeconds;
        that.vars.channelTimeshift[modifiedDataId] = Math.min(
          recordingLength,
          Math.max(0, timeshift)
        );
        // that.vars.reprint = 1;
        that._savePreferences({
          channelTimeshift: that.vars.channelTimeshift,
        });
        that._reloadCurrentWindow();
      }
    }

    if (toggle) {
      Highcharts.addEvent(document, "wheel", scroll);
    } else {
      Highcharts.removeEvent(document, "wheel", scroll);
      that.vars.reprint = 1;
      that._reloadCurrentWindow();
    }
  },

  _toggleTimeSyncMode: function (mode) {
    var that = this;
    switch (mode) {
      case "crosshair":
        $(".timesync").prop("disabled", false);
        that._toggleNoTimelockScroll(false);
        that._displayCrosshair(that.vars.crosshairPosition);
        break;
      case "notimelock":
        $(".timesync").prop("disabled", true);
        that._destroyCrosshair();
        that._toggleNoTimelockScroll(true);
        $(".time_sync").text("");
        that.vars.currentTimeDiff = 0;
        break;
      case "offset":
        // $(".time_sync").text("");
        $(".timesync").prop("disabled", false);
        that._toggleNoTimelockScroll(false);
        that._destroyCrosshair();
        break;
      case "undefined":
      default:
        $(".timesync").prop("disabled", true);
        that._toggleNoTimelockScroll(false);
        that._destroyCrosshair();
        break;
    }
  },

  _assembleTimeAlignmentObject: function () {
    // Prepares the JSON object for export of time alignment information as a JSON file

    return {
      User: "user",
      Files: "files",
      TimeDifference: 0
    }
  },


  _performCrosshairSync: function (diff) {
    // If we provide a diff parameter, use this parameter as the alignment time difference offset.
    var that = this;
    let crosshairPosition = that.vars.crosshairPosition;
    let ids = crosshairPosition.map((rec) => rec.dataId);
    let currentDiff = ids.map((id) => that.vars.channelTimeshift[id]);
    if (crosshairPosition.length === 2 || diff) {
      // calculate the difference between two recordings after adding the current difference
      if (!diff) { diff =
        crosshairPosition[0].timeInSeconds - crosshairPosition[1].timeInSeconds; }
      that.vars.currentTimeDiff += diff;
      console.log("=======" + diff + "======");
      $(".time_sync").text("Time Difference: " + that.vars.currentTimeDiff + " s");
      if (diff > 0) {
        if (currentDiff[1]) {
          let remainder = diff - currentDiff[1];
          if (remainder > 0) {
            that.vars.channelTimeshift[ids[1]] = 0;
            that.vars.channelTimeshift[ids[0]] = currentDiff[0]
              ? currentDiff[0] + remainder
              : remainder;
          } else {
            that.vars.channelTimeshift[ids[1]] = -remainder;
          }
        } else {
          that.vars.channelTimeshift[ids[0]] = currentDiff[0]
            ? currentDiff[0] + diff
            : diff;
        }
      } else if (diff < 0) {
        diff = -diff;
        if (currentDiff[0]) {
          let remainder = diff - currentDiff[0];
          if (remainder > 0) {
            that.vars.channelTimeshift[ids[0]] = 0;
            that.vars.channelTimeshift[ids[1]] = currentDiff[1]
              ? currentDiff[1] + remainder
              : remainder;
          } else {
            that.vars.channelTimeshift[ids[0]] = -remainder;
          }
        } else {
          that.vars.channelTimeshift[ids[1]] = currentDiff[1]
            ? currentDiff[1] + diff
            : diff;
        }
      }
      that.vars.reprint = 1;
      that.vars.crosshairPosition = [];
      $(this.element)
        .find(".timesync_panel select")
        .val("undefined")
        .change()
        .material_select();
      that._savePreferences({
        channelTimeshift: that.vars.channelTimeshift,
      });

      $("#alignment-alert").hide();
      that._reloadCurrentWindow();
    }
  },

  _performOffsetSync: function () {
    var that = this;
    that.vars.channelTimeshift = {};
    that.vars.reprint = 1;
    $(this.element)
      .find(".timesync_panel select")
      .val("undefined")
      .change()
      .material_select();
    that._savePreferences({ channelTimeshift: that.vars.channelTimeshift });
    that._reloadCurrentWindow();
    console.log(that.vars.channelTimeshift);
    that.vars.currentTimeDiff = 0;
    $(".time_sync").text("");
  },

  _setupTimeSyncPanel: function () {
    var that = this;
    let timeSyncOptions = that.options.timeSyncOptions || [];
    timeSyncOptions.forEach((timeSyncOption) => {
      let selectContainer = $(
        '<div class="select_panel"><select></select></div>'
      ).appendTo(that.element.find(".timesync_panel"));
      let select = selectContainer.find("select");
      let defaultOptionIndex = null;
      timeSyncOption.options.forEach((option, i) => {
        let selectedString = "";
        if (option.default) {
          selectedString = ' selected="selected"';
          defaultOptionIndex = i;
        }
        select.append(
          `<option value=${option.value}` +
            selectedString +
            ">" +
            timeSyncOption.title +
            ": " +
            option.name +
            "</option>"
        );
      });

      select.material_select();
      select.change(function () {
        if (defaultOptionIndex)
          delete timeSyncOption.options[defaultOptionIndex].default;
        timeSyncOption.options[select.prop("selectedIndex")].default = true;
        that.vars.timeSyncMode = select.val();
        that._toggleTimeSyncMode(select.val());
        that._renderAlignmentAlert();
      });
    });
    $(that.element)
      .find(".timesync")
      .click(function () {
        if (that._isInCrosshairSyncMode()) {
          that._performCrosshairSync();
        } else if (that._isInOffsetSyncMode()) {
          that._performOffsetSync();
        } else if (that._isInNoTimelockMode()) {
          // future implementations:
          // besides free scrolling by mouse wheel,
          // adding [+/-] hh:mm:ss option and [shift left/right] buttons
        }
      });
  },

  _setupIOPanel: function () {
    var that = this;

    var element = $(that.element);

    element
      .find(".fa-download")
      .click(function () {
        that._downloadCSV();
        that._downloadJSON();
      });

    element
      .find(".fa-upload")
      .click(function () {
        that._parseFile();
      });
    
    element
      .find(".fa-save")
      .click(function () {
        console.log(that.vars.chart.annotations.allItems);
        that.vars.chart.annotations.allItems.forEach(annotation => that._saveFeatureAnnotation(annotation));

      });
  },

  _isInCrosshairWindow: function (crosshair) {
    var that = this;
    return (
      that.vars.currentWindowStart <= crosshair.timeInSeconds &&
      crosshair.timeInSeconds <=
        that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds
    );
  },

  _displayCrosshair: function (crosshairPosition) {
    var that = this;
    that._destroyCrosshair();
    if (!that._isInCrosshairSyncMode()) return;
    let chart = that.vars.chart;
    that.vars.crosshair = chart.renderer.g().add();
    crosshairPosition.forEach((crosshair) => {
      if (!that._isInCrosshairWindow(crosshair)) return;
      let left = chart.plotLeft;
      let top = chart.plotTop;
      let height = chart.plotHeight;
      let heightPerChannel =
        height / that.vars.currentWindowData.channels.length;
      let firstIndexOfChannel = undefined;
      let lastIndexOfChannel = undefined;
      chart.series.forEach((channel, i) => {
        if (
          channel.options.custom.dataId === crosshair.dataId &&
          channel.points.length
        ) {
          if (typeof firstIndexOfChannel === "undefined") {
            firstIndexOfChannel = i;
          }
          lastIndexOfChannel = i;
        }
      });
      let crosshairTop = firstIndexOfChannel * heightPerChannel;
      let crosshairBottom = (lastIndexOfChannel + 1) * heightPerChannel;
      // draw the crosshair using svgPath and add it as a highchart SVGElement
      let svgPath = [
        "M",
        left + crosshair.plotX,
        top + crosshairTop,
        "L",
        left + crosshair.plotX,
        top + crosshairBottom,
      ];
      chart.renderer
        .path(svgPath)
        .attr({
          "stroke-width": 1,
          stroke: "blue",
        })
        .add(that.vars.crosshair);
    });
  },

  //checks what the dataId is of the top/bottom channels when aligning 2 channels
  //used to check if the channel is the top or bottom one when using crosshair alignment
  _getTopDataId: function () {
    //get all the channels
    var that = this;
    const channels = that.vars.currentWindowData.channels;
    //get the first channel
    const firstChannel = channels[0];
    //get the dataId of the first channel
    const firstChannelDataId = firstChannel.dataId;
    return firstChannelDataId;
  },

  _getBottomDataId: function () {
    //get all the channels
    var that = this;
    const channels = that.vars.currentWindowData.channels;
    //get the last channel
    const lastChannel = channels[channels.length - 1];
    //get the dataId of the last channel
    const lastChannelDataId = lastChannel.dataId;
    return lastChannelDataId;
  },

  _isFromSource: function (dataId, source) {
    var that = this;
    // console.log("dataId: " + dataId);
    // console.log("source: " + source);
    let found = false;

    that.options.context.dataset.forEach((dataset) => {
      // console.log(dataset, dataset._id, dataset.source);
      // console.log(dataset._id === dataId);
      // console.log(dataset.source === source);
      if (dataset._id === dataId && dataset.source === source) {
        // console.log(true)
        found = true;
      }
    });

    return found;
  },

  _isFromPSG: function (dataId) {
    var that = this;
    return that._isFromSource(dataId, "PSG");
  },

  _setCrosshair: function (point) {
    var that = this;

    // console.log("======getTopDataId()======");
    // console.log(that._getTopDataId());
    // console.log("======getBottomDataId()=====");
    // console.log(that._getBottomDataId());
    // console.log("======that.options======");
    // console.log(that.options);
    // console.log("======that.isFromPSG======");
    // console.log("-top")
    // console.log(that._isFromPSG(that._getTopDataId()));
    // console.log("-bottom")
    // console.log(that._isFromPSG(that._getBottomDataId()));
    console.log(that._isFromPSG(point.dataId));

    if (!that._isInCrosshairSyncMode()) return;

    if (
      that.vars.crosshairPosition.length === 0 &&
      !that._isFromPSG(point.dataId)
    )
      return;
    let crosshairPosition = that.vars.crosshairPosition;
    let sameRecording = false;
    let index = undefined;
    crosshairPosition.forEach((crosshair, i) => {
      if (crosshair.dataId === point.dataId) {
        sameRecording = true;
        index = i;
      }
    });
    if (sameRecording) {
      crosshairPosition[index] = point;
    } else {
      if (crosshairPosition.length < 2) {
        crosshairPosition.push(point);
      }
      // if (crosshairPosition.length > 2) {
      //   crosshairPosition.shift();
      // }
    }
    that.vars.crosshairPosition = crosshairPosition;
    that._displayCrosshair(crosshairPosition);
    that._renderAlignmentAlert();
  },

  _getClosestDisagreementWindowStartTimeInSeconds: function (direction) {
    var that = this;
    if (!that._isArbitrating()) return false;
    annotationsWithDisagreement =
      that.options.context.assignment.annotationsWithDisagreementForCurrentArbitrationRound(
        { reactive: false }
      );
    let notReclassified = Object.values(
      annotationsWithDisagreement.notReclassified
    ).map((values) => values[0].annotation.value.position.start);
    if (direction < 0) {
      notReclassified = notReclassified.filter(
        (start) => start < that.vars.currentWindowStart
      );
      if (notReclassified.length == 0) return false;
      return Math.max.apply(null, notReclassified);
    } else {
      notReclassified = notReclassified.filter(
        (start) => start > that.vars.currentWindowStart
      );
      if (notReclassified.length == 0) return false;
      return Math.min.apply(null, notReclassified);
    }
    return false;
  },

  _updateJumpToClosestDisagreementWindowButtonsEnabledStatus: function () {
    var that = this;
    const lastDisagreementWindowExists =
      that._getClosestDisagreementWindowStartTimeInSeconds(-1) !== false;
    that._setJumpToLastDisagreementWindowEnabledStatus(
      lastDisagreementWindowExists
    );
    const nextDisagreementWindowExists =
      that._getClosestDisagreementWindowStartTimeInSeconds(1) !== false;
    that._setJumpToNextDisagreementWindowEnabledStatus(
      nextDisagreementWindowExists
    );
  },

  _jumpToClosestDisagreementWindow: function (direction) {
    var that = this;
    var startInSeconds =
      that._getClosestDisagreementWindowStartTimeInSeconds(direction);
    if (startInSeconds === false) return;
    that.jumpToEpochWithStartTime(startInSeconds);
  },

  // handles keypress events
  _keyDownCallback: function (e) {
    var that = this;
    if ($(e.target).is("input, textarea, select")) {
      return;
    }
    if (swal.isVisible()) {
      return;
    }
    var keyCode = e.which;
    var metaKeyPressed = e.metaKey;
    if (keyCode == 82 && metaKeyPressed) {
      // Suppress any action on CTRL+R / CMD+R page reload
      return;
    }
    if (keyCode == 72) {
      that._toggleClassificationSummary();
    } else if (keyCode == 66 && that.options.showBookmarkCurrentPageButton) {
      that._toggleBookmarkCurrentPage();
      return;
    } else if (
      (keyCode == 37 /* || keyCode == 65 */ || keyCode == 34) &&
      that.options.showBackwardButton
    ) {
      // left arrow, a, page down
      // backward
      e.preventDefault();
      that._shiftChart(-1/5);
      return;
    } else if (
      (keyCode == 39 /* || keyCode == 68 */ || keyCode == 33) &&
      that.options.showForwardButton
    ) {
      // right arrow, d, page up
      // forward
      e.preventDefault();
      that._shiftChart(1/5);
      return;
    } else if (keyCode == 38) {
      // up arrow
      // fast foward
      e.preventDefault();
      // that._updateChannelGain("step_increase");
      that._shiftChart(1);
      return;
    } else if (keyCode == 40) {
      // down arrow
      // fast backward
      e.preventDefault();
      // that._updateChannelGain("step_decrease");
      that._shiftChart(-1);
      return;
    } else if (keyCode == 65) {
      that._jumpToClosestDisagreementWindow(-1);
    } else if (keyCode == 68) {
      that._jumpToClosestDisagreementWindow(1);
    } else if (keyCode >= 48 && keyCode <= 57) {
      e.preventDefault();
      annotation = that.vars.selectedAnnotation;

      if (annotation) {1
        featureList = that._getAnnotationLabelFromdisplayType(annotation);
        if (keyCode != 48) {
          feature = featureList[keyCode - 48];
        } else {
          feature = featureList[featureList.length - 2];
        }
        if (!feature) {
          return;
        }
        annotation.metadata.annotationLabel = feature;
        that._saveFeatureAnnotation(annotation);
      }
      
      // var featureClassButton = $(that.element)
      //   .find(".feature")
      //   .eq(keyCode - 49);
      // if (featureClassButton) {
      //   that._selectFeatureClass(featureClassButton);
      // }
      return;
      // separate case for the numpad keys, because javascript is a stupid language
    } else if (keyCode >= 97 && keyCode <= 105) {
      e.preventDefault();
      var featureClassButton = $(that.element)
        .find(".feature")
        .eq(keyCode - 97);
      if (featureClassButton) {
        that._selectFeatureClass(featureClassButton);
      }
      return;
    } else if (that.options.showSleepStageButtons) {
      var sleepStageShortCutPressed = false;
      $(that.element)
        .find(".sleep_stage_panel .shortcut-key")
        .each(function () {
          var character = $(this).text();
          var characterKeyCodeLowerCase = character.toLowerCase().charCodeAt(0);
          var characterKeyCodeAlternative = character
            .toUpperCase()
            .charCodeAt(0);
          if (
            characterKeyCodeLowerCase >= 48 &&
            characterKeyCodeLowerCase <= 57
          ) {
            characterKeyCodeAlternative = characterKeyCodeLowerCase + 48;
          }
          if (
            keyCode == characterKeyCodeLowerCase ||
            keyCode == characterKeyCodeAlternative
          ) {
            e.preventDefault();
            sleepStageShortCutPressed = true;
            var button = $(this).parents(".sleep_stage").first();
            button.click();
          }
        });
      if (sleepStageShortCutPressed) {
        return;
      }
      // make it possible to choose feature classificaiton using number keys
    }
  },

  _toggleClassificationSummary: function () {
    var that = this;
    var classificationSummaryElement = that._getClassificationSummaryElement();
    if (classificationSummaryElement.is(":visible")) {
      classificationSummaryElement.hide();
      classificationSummaryElement.css({ height: 0 });
    } else {
      classificationSummaryElement.show();
      classificationSummaryElement.css({ height: "" });
    }
    that._reinitChart();
  },

  _toggleBookmarkCurrentPage: function () {
    var that = this;
    const bookmarkedPages =
      that.options.context.preferences.annotatorConfig.bookmarkedPages || {};
    const pageKey = that.vars.currentWindowStart;
    if (bookmarkedPages[pageKey] === true) {
      delete bookmarkedPages[pageKey];
    } else {
      bookmarkedPages[pageKey] = true;
    }
    that._reinitChart();
    that._updateBookmarkCurrentPageButton();
    that._savePreferences({
      bookmarkedPages: bookmarkedPages,
    });
  },

  _updateBookmarkCurrentPageButton: function () {
    var that = this;
    const bookmarkedPages =
      that.options.context.preferences.annotatorConfig.bookmarkedPages || {};
    const pageKey = that.vars.currentWindowStart;
    const isBookmarked = bookmarkedPages[pageKey] === true;
    $(that.element)
      .find(".bookmarkCurrentPage")
      .prop("disabled", null)
      .toggleClass("active", isBookmarked);
  },

  _setupTrainingPhase: function () {
    var that = this;
    if (!that._areTrainingWindowsSpecified()) return;
    that._setForwardEnabledStatus(true);
    that._getSpecifiedTrainingWindows();
  },

  _setupArbitration: function () {
    var that = this;
    if (!that._isArbitrating()) return;
    that.options.numberOfForwardWindowsToPrefetch = 2;
    that.options.numberOfFastForwardWindowsToPrefetch = 0;
    that.options.numberOfBackwardWindowsToPrefetch = 2;
    that.options.numberOfFastBackwardWindowsToPrefetch = 0;
  },

  _setJumpToLastDisagreementWindowEnabledStatus: function (status) {
    var that = this;
    var status = !!status;

    that.vars.jumpToLastDisagreementWindow = status;
    $(that.element)
      .find(".jumpToLastDisagreementWindow")
      .prop("disabled", !status);
  },

  _setJumpToNextDisagreementWindowEnabledStatus: function (status) {
    var that = this;
    var status = !!status;

    that.vars.jumpToNextDisagreementWindow = status;
    $(that.element)
      .find(".jumpToNextDisagreementWindow")
      .prop("disabled", !status);
  },

  _setForwardEnabledStatus: function (status) {
    var that = this;
    var status = !!status;

    that.vars.forwardEnabled = status;
    $(".forward").prop("disabled", !status);
  },

  _setFastForwardEnabledStatus: function (status) {
    var that = this;
    var status = !!status;

    that.vars.fastForwardEnabled = status;
    $(".fastForward").prop("disabled", !status);
  },

  _setBackwardEnabledStatus: function (status) {
    var that = this;
    var status = !!status;

    that.vars.backwardEnabled = status;
    $(".backward").prop("disabled", !status);
  },

  _setFastBackwardEnabledStatus: function (status) {
    var that = this;
    var status = !!status;

    that.vars.fastBackwardEnabled = status;
    $(".fastBackward").prop("disabled", !status);
  },

  _selectFeatureClass: function (featureClassButton) {
    /* called with the user clicks on one of the feature toggle buttons, or presses one of the
        relevant number keys, this method updates the state of the toggle buttons, and sets the
        feature type */
    var that = this;
    featureClassButton.addClass("active");
    featureClassButton.siblings().removeClass("active");
    that.vars.activeFeatureType = featureClassButton.data("annotation-type");
  },

  _shiftChart: function (windows) {
    var that = this;
    if (!that.vars.forwardEnabled && windows >= 1) return;
    if (
      !that.vars.fastForwardEnabled &&
      windows >= that.options.windowJumpSizeFastForwardBackward
    )
      return;
    if (!that.vars.backwardEnabled && windows <= -1) return;
    if (
      !that.vars.fastBackwardEnabled &&
      windows <= -that.options.windowJumpSizeFastForwardBackward
    )
      return;
    var nextRecordings = that.options.allRecordings;
    var nextWindowSizeInSeconds = that.vars.xAxisScaleInSeconds;
    var nextWindowStart = that.options.currentWindowStart;
    if (that.options.experiment.running) {
      var currentWindowIndex =
        that.options.experiment.current_condition.current_window_index;
      currentWindowIndex += windows;
      that.options.experiment.current_condition.current_window_index =
        currentWindowIndex;
      nextWindowStart =
        that.options.experiment.current_condition.windows[currentWindowIndex];
      that._updateNavigationStatusForExperiment();
    } else if (
      that._areTrainingWindowsSpecified() &&
      that._isCurrentWindowTrainingWindow()
    ) {
      that.vars.currentTrainingWindowIndex += windows;
      if (that._isCurrentWindowTrainingWindow()) {
        var nextTrainingWindow = that._getCurrentTrainingWindow();
        let id = Data.findOne({
          path: nextTrainingWindow.recordingName,
        })._id;
        nextRecordings = [{ _id: id, path: nextTrainingWindow.recordingName }];
        nextWindowStart = nextTrainingWindow.timeStart;
        nextWindowSizeInSeconds = nextTrainingWindow.windowSizeInSeconds;
      } else {
        nextWindowStart = that.options.startTime;
        nextWindowSizeInSeconds = that.vars.xAxisScaleInSeconds;
      }
      that._flushAnnotations();
    } else {
      if (that._areTrainingWindowsSpecified()) {
        that.vars.currentTrainingWindowIndex += windows;
      }
      nextWindowStart = Math.max(
        0,
        that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds * windows
      );
    }
    that._switchToWindow(
      nextRecordings,
      nextWindowStart,
      nextWindowSizeInSeconds
    );
  },

  _switchToWindow: function (allRecordings, start_time, window_length) {
    // the main funciton called when navigating to another window
    var that = this;
    //console.log("_switchToWindow.that:", that);

    // can be ignored for now, something to do with the machine learning component of the app
    // console.log(!that._isCurrentWindowSpecifiedTrainingWindow());
    
    if (!that._isCurrentWindowSpecifiedTrainingWindow()) {
      //console.log("0");
      if (that.options.visibleRegion.start !== undefined) {
        //console.log("0-1");
        start_time = Math.max(that.options.visibleRegion.start, start_time);
        start_time = window_length * Math.ceil(start_time / window_length);

        that._setBackwardEnabledStatus(
          start_time - window_length >= that.options.visibleRegion.start
        );
        that._setFastBackwardEnabledStatus(
          start_time -
            window_length * that.options.windowJumpSizeFastForwardBackward >=
            that.options.visibleRegion.start
        );
      }
      // console.log(that.options.visibleRegion.end);
      if (that.options.visibleRegion.end !== undefined) {
        //console.log("0-2");
        start_time = Math.min(
          that.options.visibleRegion.end - window_length,
          start_time
        );
        start_time = window_length * Math.floor(start_time / window_length);
        var forwardEnabled =
          start_time + window_length <=
          that.options.visibleRegion.end - window_length;
        that._setForwardEnabledStatus(forwardEnabled);
        if (!forwardEnabled) {
          //console.log("0-2-1");
          that._lastWindowReached();
        }
        var fastForwardEnabled = start_time +
        window_length * that.options.windowJumpSizeFastForwardBackward <
        that.options.visibleRegion.end - window_length;
        
        // console.log(fastForwardEnabled);

        that._setFastForwardEnabledStatus(
          fastForwardEnabled
        );
      }
    }

    if (that.vars.currentWindowStart != start_time) {
      //if the window has changed (i.e. the user has clicked on a new window)
      //console.log("1");
      that._setNumberOfAnnotationsInCurrentWindow(0); // reset the number of annotations in the current window
    }

    that.vars.currentWindowStart = start_time; // update the current window start
    that.vars.currentWindowRecording = that.options.recordingName; // update the current window recording
    that._updateJumpToClosestDisagreementWindowButtonsEnabledStatus();

    //
    if (that._isVisibleRegionDefined()) {
      //console.log("2");
      var progress = that._getProgressInPercent();
      $(that.element)
        .find(".progress-bar")
        .css("width", progress + "%");
    }

    if (that._isCurrentWindowLastTrainingWindow() && that._isTrainingOnly()) {
      //console.log("3");
      that._lastWindowReached();
    }

    if (that._isCurrentWindowFirstTrainingWindow() && !that._isTrainingOnly()) {
      //console.log("4");
      bootbox
        .alert({
          closeButton: false,
          title: "Beginning of the Training Phase",
          message:
            "Welcome to our CrowdEEG experiment for scientific crowdsourcing!<br><br>This is the beginning of the training phase, meaning that, for the next " +
            that._getNumberOfTrainingWindows() +
            " window(s), we will show you the correct answer after you have submitted yours. The examples panel below will be visible throughout the entire task. We hope the training phase will help you learn more about the signal pattern we are looking for.",
          callback: function () {
            that._saveUserEventWindowBegin();
          },
        })
        .css({ zIndex: 1 })
        .appendTo(that.element);
    } else {
      //console.log("4-1");
      that._saveUserEventWindowBegin();
    }

    that._savePreferences({ startTime: start_time });

    var windowsToRequest = [
      //stores all "pre loaded" windows
      start_time,
    ];
    if (
      !that._isCurrentWindowSpecifiedTrainingWindow() &&
      !that.options.experiment.running &&
      !that._isInNoTimelockMode() // stop caching windows if in no timelock mode
    ) {
      //console.log("5");
      for (var i = 1; i <= that.options.numberOfForwardWindowsToPrefetch; ++i) {
        windowsToRequest.push(start_time + i * window_length);
      }
      for (
        var i = 1;
        i <= that.options.numberOfFastForwardWindowsToPrefetch;
        ++i
      ) {
        let window = start_time + i * that.options.windowJumpSizeFastForwardBackward * window_length;
        if (!windowsToRequest.includes(window)) {
          windowsToRequest.push(window);
        }
      }
      for (
        var i = 1;
        i <= that.options.numberOfBackwardWindowsToPrefetch;
        ++i
      ) {
        let window = start_time - i * window_length;
        if (!windowsToRequest.includes(window)) {
          windowsToRequest.push(window);
        }
      }
      for (
        var i = 1;
        i <= that.options.numberOfFastBackwardWindowsToPrefetch;
        ++i
      ) {
        let window = start_time - i * that.options.windowJumpSizeFastForwardBackward * window_length;
        if (!windowsToRequest.includes(window)) {
          windowsToRequest.push(window);
        }
      }
    }
    windowsToRequest.forEach((windowStartTime) => {
      //console.log("6, windowStartTime:", windowStartTime);
      // gets the data for all the prefetched windows
      var startTime = (windowStartTime > 0 ? 
        (windowStartTime < that.vars.recordingLengthInSeconds + window_length ? Math.min(that.vars.recordingLengthInSeconds, windowStartTime) : windowStartTime):
        (windowStartTime > -window_length ? Math.max(0, windowStartTime) : windowStartTime)
        );
      
      var options = {
        recordings: allRecordings,
        channels_displayed: that._getChannelsDisplayed(), // get all channels we would like to display
        start_time: startTime,
        channel_timeshift: that.vars.channelTimeshift,
        window_length: window_length,
        target_sampling_rate: that.options.targetSamplingRate,
        use_high_precision_sampling: that.options.useHighPrecisionSampling,
      };
      that._requestData(options, (data, errorData) => {
        //console.log("7, data:", data);
        var windowAvailable = !errorData;
        // console.log(errorData);
        if (
          windowAvailable &&
          windowStartTime == that.vars.currentWindowStart
        ) {
          that._applyFrequencyFilters(data, (dataFiltered) => {
            that.vars.currentWindowData = dataFiltered;
            that._populateGraph(that.vars.currentWindowData);
          });
        }

        that._displayCrosshair(that.vars.crosshairPosition);
        if (!that.options.experiment.running) {
          if (that._isInNoTimelockMode()) {
            that._setForwardEnabledStatus(false);
            that._setFastForwardEnabledStatus(false);
            that._setBackwardEnabledStatus(false);
            that._setFastBackwardEnabledStatus(false);
          } else {
            // enable/disable the forward backward buttons according to the current position
        

            switch (windowStartTime) {
              case that.vars.currentWindowStart + window_length:
                if (that.options.visibleRegion.end === undefined) {
                  //console.log('winAva:', windowAvailable);
                  that._setForwardEnabledStatus(windowAvailable);
                  if (!windowAvailable) {
                    that._lastWindowReached();
                  }
                }
                
              case that.vars.currentWindowStart +
                window_length * that.options.windowJumpSizeFastForwardBackward:
                if (that.options.visibleRegion.end === undefined) {

                  that._setFastForwardEnabledStatus(windowAvailable);
                }
                // break;
              case that.vars.currentWindowStart - window_length:
                if (that.options.visibleRegion.start === undefined) {
                  that._setBackwardEnabledStatus(windowAvailable);
                }
                // break;
              case that.vars.currentWindowStart -
                window_length * that.options.windowJumpSizeFastForwardBackward:
                if (that.options.visibleRegion.start === undefined) {
                  that._setFastBackwardEnabledStatus(windowAvailable);
                }
                // break;
            }
          }
        }
      });
    });
  },

  jumpToEpochWithStartTime: function (epochStartTimeInSeconds) {
    var that = this;
    if (
      isNaN(epochStartTimeInSeconds) ||
      epochStartTimeInSeconds === undefined
    ) {
      console.error(
        "Cannot jump to epoch with start time",
        epochStartTimeInSeconds
      );
      return;
    }
    that._switchToWindow(
      that.options.allRecordings,
      epochStartTimeInSeconds,
      that.vars.xAxisScaleInSeconds
    );
  },

  getCurrentWindowStartReactive: function () {
    var that = this;
    return that.vars.currentWindowStartReactive.get();
  },

  _reloadCurrentWindow: function () {
    //console.log("_reloadCurrentWindow");
    var that = this;
    // reloads the current window by "switching" to it using the current window start time, the current x axis scale and the current recordings
    that._switchToWindow(
      that.options.allRecordings,
      that.vars.currentWindowStart,
      that.vars.xAxisScaleInSeconds
    );
  },

  _reinitChart: function () {
    //function that reinitializes the charts
    var that = this;
    if (that.vars.chart) {
      that.vars.chart.destroy(); //destroys the chart
    }

    // deletes all annotations currently loaded and cached
    that.vars.chart = undefined;
    that.vars.annotationsLoaded = false;
    that.vars.annotationsCache = {};

    //console.log("_reinitChart");
    that._reloadCurrentWindow();
  },

  _getProgressInPercent: function () {
    var that = this;
    if (!that._isVisibleRegionDefined()) return;
    var windowSize = that.vars.xAxisScaleInSeconds;
    var start =
      windowSize * Math.ceil(that.options.visibleRegion.start / windowSize);
    var end =
      windowSize *
      Math.floor((that.options.visibleRegion.end - windowSize) / windowSize);
    if (!that._areTrainingWindowsSpecified()) {
      var progress =
        (that.vars.currentWindowStart - start + windowSize) /
        (end - start + 2 * windowSize);
    } else {
      var numberOfTrainingWindows = that._getNumberOfTrainingWindows();
      var numberOfWindowsInVisibleRegion = Math.floor(
        (end - start) / windowSize
      );
      var numberOfWindowsTotal =
        numberOfWindowsInVisibleRegion + numberOfTrainingWindows;
      var currentWindowIndex = that.vars.currentTrainingWindowIndex;
      var progress = (currentWindowIndex + 1) / (numberOfWindowsTotal + 2);
    }
    var progressInPercent = Math.ceil(progress * 100);
    return progressInPercent;
  },

  _switchBackToLastActiveWindow: function () {
    var that = this;
    if (!that.vars.lastActiveWindowStart) {
      that.vars.lastActiveWindowStart = 0;
    }
    that._switchToWindow(
      that.options.allRecordings,
      that.vars.lastActiveWindowStart,
      that.vars.xAxisScaleInSeconds
    );
  },

  _requestData: function (options, callback) {
    var that = this;
    // console.log(that.vars.allRecordings);
    // identifierKey includes:
    // 'recordings'
    // 'start_time'
    // 'window_length'
    // 'channels_displayed'
    var identifierKey = that._getIdentifierKeyForDataRequest(options);
    //console.log("identifierKey", identifierKey);
    var noDataError =
      "No data available for window with options " + JSON.stringify(options);

    if (options.start_time < 0) {
      that.vars.windowsCache[identifierKey] = false;
      //console.log("options.start_time < 0");
    } else if (options.start_time > that.vars.recordingLengthInSeconds) {
      that.vars.windowsCache[identifierKey] = false;
      //console.log("options.start_time > that.vars.recordingLengthInSeconds");
    }
    if (that.vars.windowsCache[identifierKey] === false) {
      if (callback) {
        //console.log("that.vars.windowsCache[identifierKey] === false");

        callback(null, noDataError);
      }
      return;
    }

    var reprint = that.vars.reprint;
    //console.log("reprint", reprint);
    if (reprint === 1 || that._isInNoTimelockMode()) {
      that.vars.windowsCache = {};
    } else if (
      that.vars.windowsCache[identifierKey] &&
      that.vars.windowsCache[identifierKey].data &&
      callback
    ) {
      callback(that.vars.windowsCache[identifierKey].data);
      return;
    }
    const numSecondsToPadBeforeAndAfter = 2;

    const optionsPadded = JSON.parse(JSON.stringify(options));

    optionsPadded.start_time -= numSecondsToPadBeforeAndAfter;

    optionsPadded.start_time = Math.max(0, optionsPadded.start_time);

    const numSecondsPaddedBefore =
      options.start_time - optionsPadded.start_time;

    optionsPadded.window_length =
      options.window_length +
      numSecondsPaddedBefore +
      numSecondsToPadBeforeAndAfter;

    optionsPadded.low_resolution_data =
      that._isInNoTimelockMode() ||
      optionsPadded.window_length >
        300 + numSecondsPaddedBefore + numSecondsToPadBeforeAndAfter;

    Meteor.call("get.edf.data", optionsPadded, (error, data) => {
      if (error) {
        //console.log(error.message);
        callback(null, error.message);
        return;
      }
      //console.log("edf.data", data);
      if (!that._isDataValid(data)) {
        that.vars.windowsCache[identifierKey] = false;

        if (callback) {
          callback(null, noDataError);
        }
      } else {
        that.vars.windowsCache[identifierKey] = {};
        // transform the data before storing or displaying them
        that.vars.windowsCache[identifierKey].data = that._transformData(
          data,
          numSecondsPaddedBefore,
          options.window_length,
          numSecondsToPadBeforeAndAfter
        );
        that.vars.reprint = 0;
        if (callback) {
          callback(that.vars.windowsCache[identifierKey].data);
        }
      }
    });

    that.vars.windowsCache[identifierKey] = {
      request: "placeholder",
    };
  },

  _transformData: function (
    input,
    numSecondsPaddedBefore,
    numSecondsDataOfInterest,
    numSecondsPaddedAfter
  ) {
    // //console.log("inside here");
    var that = this;
    var channels = [];
    var options = that.vars.valueOptions;
    if (options == null) {
      options = 0;
    }

    var channelAudioRepresentations = {};
    var channelNumSamples = {};
    var samplingRate = input.sampling_rate;
    // console.log("samplingRate", samplingRate);
    // console.log(that.options.targetSamplingRate);
    // for each dataId in the channelvalues array
    for (var dataId in input.channel_values) {
      // console.log(that._getCurrentMontage());
      //console.log(
      // 	"==============================================================================================="
      // );
      for (var name in input.channel_values[dataId]) {
        var values = input.channel_values[dataId][name];
        // console.log("Channel Name:" + name);
        // console.log(values);
        ////console.log(that.vars.audioContextSampleRate);
        var offlineCtx = new OfflineAudioContext(
          1,
          values.length,
          that.vars.audioContextSampleRate
        );
        var audioBuffer = offlineCtx.createBuffer(
          1,
          values.length,
          offlineCtx.sampleRate
        );
        var scaleFactorFrequency = offlineCtx.sampleRate / samplingRate;

        //gets the max value in the values array
        var scaleFactorAmplitude = Math.max(...values.map(Math.abs));

        var maxIn = scaleFactorAmplitude;

        var valuesLength = values.length;

        // var y95 = 0;
        // var y05 = 0;
        // scaleFactorAmplitude = values
        // 	.map(Math.abs)
        // 	.reduce((a, b) => Math.max(a, b)); //that._findMeanPercentile(0.95,0.005,values, valuesLength);
        // ////console.log(name);

        // is the average of the values
        var avg = values.reduce((a, b) => a + b) / valuesLength;
        avg = Math.abs(avg);
        ////console.log(avg);

        // adds up the difference of the values from the average
        var changeVal = values.reduce((a, b) => a + Math.abs(avg - b));

        ////console.log(changeVal);

        // //console.log(name);
        //   //console.log(scaleFactorAmplitude) ;

        // scaleValueChange = Math.pow(scaleFactorAmplitude, 2);
        var scaleValueChange = maxIn * scaleFactorAmplitude;

        // checks if there are negative and positive values in the values array
        const hasNegativeValues = values.some((v) => v <= 0);
        const hasPositiveValues = values.some((v) => v >= 0);

        // if the array has only negative or positive values, then we add/subtract the avg
        if (!(hasNegativeValues && hasPositiveValues)) {
          if (hasPositiveValues) {
            values = values.map((v) => v - avg);
          } else {
            values = values.map((v) => v + avg);
          }
        }

        if (scaleFactorAmplitude != 0) {
          //  //console.log(name);
          // gets every value and divides it by the scaleFactorAmplitude, the max value in the values array
          // console.log(name);
          // console.log(scaleFactorAmplitude);

          valuesScaled = values.map((v) => v / scaleFactorAmplitude);
          // //console.log(valuesScaled);
        }

        // console.log(valuesScaled);
        audioBuffer.copyToChannel(valuesScaled, 0, 0);

        var scaleFault = 0;
        if (options == 0) {
          // if the amplitude is not scaled (default amplitude)
          switch (name) {
            case "F4-A1":
              scaleFault = 1;
              break;

            case "C4-A1":
              scaleFault = 1;
              break;
            case "O2-A1":
              scaleFault = 1;
              break;
            case "LOC-A2":
              scaleFault = 1;
              break;
            case "ROC-A1":
              scaleFault = 1;
              break;
            case "Chin 1-Chin 2":
              scaleFault = 500;
              break;
            // case "eeg-ch1":
            // 	scaleFault = 0.05;
            // 	break;
            // case "eeg-ch2":
            // 	scaleFault = 0.5;
            // 	break;
            // case "eeg-ch3":
            // 	scaleFault = 0.05;
            // 	break;
            // case "eeg-ch4":
            // 	scaleFault = 0.05;
            // 	break;

            case "ECG":
              scaleFault = 100;
              break;
            case "Leg/L":
              scaleFault = 50;
              break;
            case "Leg/R":
              scaleFault = 50;
              break;
            case "Snore":
              scaleFault = 600;
              break;
            case "Airflow":
              scaleFault = 100;
              break;
            case "Nasal Pressure":
              scaleFault = 100;
              break;
            case "Thor":
              scaleFault = 500;
              break;

            case "Abdo":
              scaleFault = 100;
              break;
            case "SpO2":
              scaleFault = 1.5;
              break;
            case "Pleth":
              scaleFault = 0.03;
              break;
            case "Accl Pitch":
              scaleFault = 10;
              break;
            case "Accl Roll":
              scaleFault = 10;
              break;
            case "Resp Effort":
              scaleFault = 100;
              break;
            case "HR(bpm)":
              scaleFault = 3.5;
              break;
            case "SpO2(%)":
              scaleFault = 3.5;
              break;
            case "PI(%)":
              scaleFault = 85;
              break;
            case "PAT(ms)":
              scaleFault = 0.1;
              break;
            case "Chest Temp(A C)":
              scaleFault = 10;
              break;
            case "Limb Temp(A C)":
              scaleFault = 10;
              break;
            case "Temp":
              scaleFault = 100;
              break;
            case "light":
              scaleFault = 100;
              break;
            case "ENMO":
              scaleFault = 100;
              break;
            case "z-angle":
              scaleFault = 100;
              break;
          }
          scaleFactorAmplitude = scaleFactorAmplitude * scaleFault;
          sessionStorage.setItem(
            dataId + name + "scaleFactorAmplitude",
            scaleFault
          );

          ////console.log(name);
          // //console.log(scaleFactorAmplitude);
        } else if (options == 2) {
          ////console.log(changeVal);
          // //console.log(scaleFactorAmplitude);
          while (
            changeVal > 0 &&
            scaleValueChange > 0 &&
            changeVal < 10000 &&
            scaleValueChange * 10 < 500
          ) {
            //       //console.log(changeVal);
            scaleFactorAmplitude = scaleFactorAmplitude * 3;
            //scaleValueChange = scaleFactorAmplitude*maxIn;
            //  //console.log(scaleFactorAmplitude*maxIn);
            changeVal = changeVal * 7;
          }
          // //console.log(name);
          //  //console.log(scaleFactorAmplitude);
          sessionStorage.setItem(
            dataId + name + "scaleFactorAmplitude",
            scaleFactorAmplitude
          );
        } else if (options == 1) {
          //if the amplitude has to be scaled
          //requiredName = "Thor"//sessionStorage.getItem("requiredName");
          let channelOnChange = that.vars.channelAmplitudeOnChange;
          // //console.log(requiredName);
          var scaleFault = sessionStorage.getItem(
            dataId + name + "scaleFactorAmplitude"
          );
          var oncecheck = that.vars.increaseOnce;
          if (
            name === channelOnChange.name &&
            dataId === channelOnChange.dataId &&
            oncecheck == 1
          ) {
            scaleFault = scaleFault * 5;
            that.vars.increaseOnce = 0;
          }

          sessionStorage.setItem(
            dataId + name + "scaleFactorAmplitude",
            scaleFault
          );
          //sessionStorage.setItem(("requiredName"),"");
          scaleFactorAmplitude = scaleFactorAmplitude * scaleFault;
          // //console.log(sessionStorage.setItem((name+"scaleFactorAmplitude"), scaleFault));
          //  //console.log(scaleFault);
          ////console.log(scaleFactorAmplitude);
        } else if (options == -1) {
          //requiredName = "Thor"//sessionStorage.getItem("requiredName");
          var scaleFault = sessionStorage.getItem(
            dataId + name + "scaleFactorAmplitude"
          );
          let channelOnChange = that.vars.channelAmplitudeOnChange;
          var oncecheck = that.vars.increaseOnce;
          if (
            name === channelOnChange.name &&
            dataId === channelOnChange.dataId &&
            oncecheck == 1
          ) {
            scaleFault = scaleFault / 5;
            that.vars.increaseOnce = 0;
          }
          // //console.log(sessionStorage.setItem((name+"scaleFactorAmplitude"), scaleFault));
          ////console.log(scaleFault);
          sessionStorage.setItem(
            dataId + name + "scaleFactorAmplitude",
            scaleFault
          );
          scaleFactorAmplitude = scaleFactorAmplitude * scaleFault;
        }
        /*   
                    if(scaleValueChange > 500 ){
                        scaleValueChange = 500/maxIn;
                        scaleFactorAmplitude = scaleValueChange;
                    }
                */
        if (!channelAudioRepresentations[dataId])
          channelAudioRepresentations[dataId] = {};
        channelAudioRepresentations[dataId][name] = {
          buffer: audioBuffer,
          scaleFactors: {
            frequency: scaleFactorFrequency,
            amplitude: scaleFactorAmplitude,
          },
        };
        var numSamplesPaddedBefore = numSecondsPaddedBefore * samplingRate;
        var numSamplesDataOfInterest = Math.min(
          numSecondsDataOfInterest * samplingRate,
          values.length - numSamplesPaddedBefore
        );

        var numSamplesPaddedAfter =
          values.length - numSamplesPaddedBefore - numSamplesDataOfInterest;
        if (!channelNumSamples[dataId]) channelNumSamples[dataId] = {};
        channelNumSamples[dataId][name] = {
          paddedBefore: numSamplesPaddedBefore,
          dataOfInterest: numSamplesDataOfInterest,
          paddedAfter: numSamplesPaddedAfter,
        };
      }
    }

    for (var i = 0; i < input.channel_order.length; ++i) {
      var name = input.channel_order[i].name;
      let dataId = input.channel_order[i].dataId;
      if (channelNumSamples[dataId][name]) {
        var channel = {
          name: name,
          dataId: dataId,
          audio: channelAudioRepresentations[dataId][name],
          numSamples: channelNumSamples[dataId][name],
        };
        let arrayLength = Math.max(
          channel.audio.buffer.length - channel.numSamples.paddedBefore,
          1
        );
        channel.valuesPadded = new Float32Array(arrayLength);
        channels.push(channel);
      }
    }
    var output = {
      channels: channels,
      sampling_rate: input.sampling_rate,
    };
    return output;
  },

  _findMeanPercentile: function (top, bottom, values, thisCounting) {
    var sortValues = values;
    sortValues.sort();
    var upside = top * thisCounting;
    var downside = bottom * thisCounting;

    var topValue = sortValues[Math.ceil(upside)];
    var bottomValue = sortValues[Math.floor(downside)];

    return (topValue + bottomValue) / 2, topValue, bottomValue;
  },

  _applyFrequencyFilters: function (data, callback) {
    var that = this;
    var numRemainingChannelsToFilter = data.channels.length;
    var maxDetectableFrequencyInHz = data.sampling_rate / 2;
    var frequencyFilters = that.vars.frequencyFilters || [];
    data.channels.forEach((channel, c) => {
      var staticFrequencyFilters =
        that._getStaticFrequencyFiltersForChannel(channel);
      var buffer = channel.audio.buffer;
      var offlineCtx = new OfflineAudioContext(
        1,
        buffer.length,
        that.vars.audioContextSampleRate
      );
      var valuesFiltered = data.channels[c].valuesFilteredHolder;
      var bufferSource = offlineCtx.createBufferSource();
      bufferSource.buffer = buffer;
      var currentNode = bufferSource;
      const allFrequencyFilters =
        staticFrequencyFilters.concat(frequencyFilters);
      allFrequencyFilters.forEach((frequencyFilter) => {
        var filterType = frequencyFilter.type;
        var frequencyInHz = parseFloat(frequencyFilter.selectedValue);
        if (
          isNaN(frequencyInHz) ||
          frequencyInHz === undefined ||
          frequencyInHz <= 0
        ) {
          return;
        }
        if (frequencyInHz > maxDetectableFrequencyInHz) {
          // //console.log('Not applying ' + filterType + ' filter with frequency ' + frequencyInHz + 'Hz as it exceeds the maximum detectable frequency of ' + maxDetectableFrequencyInHz + 'Hz for this data, sampled at ' + data.sampling_rate + 'Hz.');
          return;
        }
        // //console.log('Applying ' + filterType + ' filter with frequency ' + frequencyInHz + 'Hz.');
        var filterNode = offlineCtx.createBiquadFilter();
        filterNode.type = filterType;
        var scaleFactorFrequency = channel.audio.scaleFactors.frequency;
        filterNode.frequency.value = frequencyInHz * scaleFactorFrequency;
        // If filter results are not as expected,
        // double check settings for Q factor:
        //   - https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
        //   - https://electronics.stackexchange.com/questions/221887/does-q-factor-matter-for-low-pass-and-high-pass-filters
        //   - https://stackoverflow.com/questions/33540440/bandpass-filter-which-frequency-and-q-value-to-represent-frequency-range
        // filterNode.Q.value = 1 (default)
        currentNode.connect(filterNode);
        currentNode = filterNode;
      });
      currentNode.connect(offlineCtx.destination);
      bufferSource.start();
      offlineCtx
        .startRendering()
        .then((bufferFiltered) => {
          bufferFiltered.copyFromChannel(
            channel.valuesPadded,
            0,
            channel.numSamples.paddedBefore
          );
          channel.values = channel.valuesPadded.subarray(
            0,
            channel.numSamples.dataOfInterest
          );
          var scaleFactorAmplitude = channel.audio.scaleFactors.amplitude;
          if (scaleFactorAmplitude != 0) {
            channel.values = channel.values.map(
              (v) => v * scaleFactorAmplitude
            );
            //   //console.log(buffer);
            //  //console.log(channel.values);
          }
          --numRemainingChannelsToFilter;
          if (numRemainingChannelsToFilter <= 0) {
            callback(data);
          }
        })
        .catch((error) => {
          console.error("Rendering failed", error);
        });
    });
  },

  _getIdentifierObjectForDataRequest: function (options) {
    var options = options || {};
    var relevantOptions = [
      "recordings",
      "start_time",
      "window_length",
      "channels_displayed",
    ];
    var identifierObject = {};
    for (var i = 0; i < relevantOptions.length; ++i) {
      identifierObject[relevantOptions[i]] = options[relevantOptions[i]];
    }
    return identifierObject;
  },

  _getIdentifierKeyForDataRequest: function (options) {
    var that = this;
    var identifierKey = JSON.stringify(
      that._getIdentifierObjectForDataRequest(options)
    );
    return identifierKey;
  },

  _isDataValid: function (data) {
    if (!data) return false;
    if (!data.sampling_rate) return false;
    if (!data.channel_order) return false;
    if (!data.channel_values) return false;
    for (let dataId in data.channel_values) {
      if (Object.keys(data.channel_values[dataId]).length == 0) return false;
    }
    return true;
  },

  _populateGraph: function (data) {
    /* plot all of the points to the chart */
    var that = this;

    // if the chart object does not yet exist, because the user is loading the page for the first time
    // or refreshing the page, then it's necessary to initialize the plot area
    if (!that.vars.chart) {
      // if this is the first pageload, then we'll need to load the entire
      console.time("_initGraph");
      that._initGraph(data);
      //console.log("[[time end]]");
      console.timeEnd("_initGraph");
      // if the plot area has already been initialized, simply update the data displayed using AJAX calls
      
      that._updateChannelDataInSeries(that.vars.chart.series, data);

      // console.log("here we scale all channels to screen");
      that._scaleAllToScreen();
      that.vars.chart.redraw();

      that._addChangePointLabelFixed();
      // see http://jsfiddle.net/ajxyuax2/1/ 
    }

    // updates the data that will be displayed in the chart
    // by storing the new data in this.vars.chart.series
    that._updateChannelDataInSeries(that.vars.chart.series, data);

    // sets the min and max values for the chart
    that.vars.chart.xAxis[0].setExtremes(
      that.vars.currentWindowStart,
      that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds,
      false,
      false
    );

    that.vars.recordScalingFactors = false;
    that.vars.recordPolarity = false;
    that.vars.recordTranslation = false;

    // checks if the object is empty
    if (!that._objectIsEmpty(that.vars.scalingFactors)) {
      for (const index in that.vars.scalingFactors) {
        that._customAmplitude(
          index,
          100 * (that.vars.scalingFactors[index] - 1)
        );
        // console.log("scaling after page change");
        // console.log(that.vars.chart.series[index].yData);
      }

    }

    if (!that._objectIsEmpty(that.vars.translation)) {
      for (const index in that.vars.translation) {
        that._customTranslation(index, that.vars.translation[index]);
      }
    }

    if (!that._objectIsEmpty(that.vars.polarity)) {
      for (const index in that.vars.polarity) {
        that._reversePolarity(index);
      }
    }

    that.vars.recordPolarity = true;
    that.vars.recordScalingFactors = true;
    that.vars.recordTranslation = true;

    that.vars.chart.redraw(); // efficiently redraw the entire window in one go

    // use the chart start/end so that data and annotations can never
    // get out of synch
    that._refreshAnnotations();
    that._renderChannelSelection();
    that._updateBookmarkCurrentPageButton();
    that.vars.currentWindowStartReactive.set(that.vars.currentWindowStart);
  
    that._updateChangePointLabelFixed();
    that.vars.chart.annotations.allItems.forEach(annotation => {that._updateControlPoint(annotation)});
  },

  //checks if an object is empty
  _objectIsEmpty: function (obj) {
    return JSON.stringify(obj) === "{}";
  },

  _updateChannelDataInSeries: function (series, data) {
    var that = this;
    var channels = data.channels; // gets the channels from the data object

    //gets the xValues for the graph using from the data object i.e the time values
    var xValues = Array.from(
      data.channels[0].values.map(function (value, index) {
        return that.vars.currentWindowStart + index / data.sampling_rate;
      })
    );

    // gets the recording end in seconds snapped to the nearest second
    var recordingEndInSecondsSnapped = that._getRecordingEndInSecondsSnapped();

    return channels.map(function (channel, c) {
      // for each channel, we get the channel name (channel)
      // and the channel index (c)

      // using them, we get the flipfactor and gain
      var flipFactor = that._getFlipFactorForChannel(channel);
      var gain = that._getGainForChannelIndex(c);

      if (gain === undefined) {
        gain = 1.0;
      }

      var flipFactorAndGain = flipFactor * gain;

      // gets some additional information needed to graph using channel and c
      var offsetPreScale = that._getOffsetForChannelPreScale(channel);
      var offsetPostScale = that._getOffsetForChannelIndexPostScale(c);

      // gets the values
      samplesScaledAndOffset = channel.values.map(function (value, v) {
        return (value + offsetPreScale) * flipFactorAndGain + offsetPostScale;
      });

      // creates an array that stores all the data
      var seriesData = xValues.map(function (x, i) {
        return [x, samplesScaledAndOffset[i]];
      });

      // adds the offset needed to the start of the graph
      seriesData.unshift([-that.vars.xAxisScaleInSeconds, offsetPostScale]);

      // adds the offset needed to the end of the graphID
      seriesData.push([recordingEndInSecondsSnapped, offsetPostScale]);

      // stores in the series that we input into the funciton, at index c
      series[c].setData(seriesData, false, false, false);
    });
  },

  _initSeries: function (data) {
    var that = this;
    var samplingRate = data.sampling_rate;
    var channels = data.channels;
    var recordingEndInSecondsSnapped = that._getRecordingEndInSecondsSnapped();
    return channels.map(function (channel, c) {
      var offset = that._getOffsetForChannelIndexPostScale(c);
      return {
        name: channel.name,
        custom: {
          dataId: channel.dataId,
        },
        data: [
          [0, offset],
          [recordingEndInSecondsSnapped, offset],
        ],
      };
    });
  },

  _getRecordingEndInSecondsSnapped: function () {
    var that = this;
    return (
      (Math.ceil(
        that.vars.recordingLengthInSeconds / that.vars.xAxisScaleInSeconds
      ) +
        1) *
      that.vars.xAxisScaleInSeconds
    );
  },

  _getLatestPossibleWindowStartInSeconds: function () {
    var that = this;
    return (
      Math.floor(
        that.vars.recordingLengthInSeconds / that.vars.xAxisScaleInSeconds
      ) * that.vars.xAxisScaleInSeconds
    );
  },

  _getClassificationSummaryElement: function () {
    var that = this;
    return $(that.element)
      .parents(".annotator-edf")
      .find(".classification-summary");
  },

  _initGraph: function (data) {
    /* This method is called only when the page is first loaded, it sets up the plot area, the
        axis, channel name labels, time formatting and everything else displayed on the plot

        subsequent changes to this plot to scroll through the signal use the much computationally expensive
        series update and axis update methods.
        */
    //console.log("!!!!!!init graph");
    var that = this;
    var channels = data.channels;

    that.vars.graphID = "time-series-graph-" + that._getUUID();
    var graph = $(".graph");
    graph.children().remove();
    graph.append(
      '<div id="' + that.vars.graphID + '" style="margin: 0 auto"></div>'
    );

    var classificationSummaryContainer =
      that._getClassificationSummaryElement();
    if (classificationSummaryContainer.length == 0) {
      var classificationSummaryHeight = 0;
    } else {
      var classificationSummaryHeight =
        classificationSummaryContainer.height() +
        parseInt(classificationSummaryContainer.css("margin-top")) +
        parseInt(classificationSummaryContainer.css("margin-bottom"));
    }
    var graphHeight =
      $(that.element).height() -
      (parseInt(graph.css("padding-top")) +
        parseInt(graph.css("padding-bottom")) +
        parseInt(graph.css("margin-top")) +
        parseInt(graph.css("margin-bottom"))) -
      classificationSummaryHeight;
    var graphContainerOtherChildren = $(that.element)
      .find(".graph_container > *")
      .not(graph);
    graphContainerOtherChildren.each(function () {
      var child = $(this);
      graphHeight -=
        child.height() +
        parseInt(child.css("margin-top")) +
        parseInt(child.css("margin-bottom"));
    });

    bookmarkData = [];
    const bookmarkedPages =
      that.options.context.preferences.annotatorConfig.bookmarkedPages;
    for (pageKey in bookmarkedPages) {
      if (bookmarkedPages[pageKey] === true) {
        bookmarkData.push(parseInt(pageKey));
      }
    }
    bookmarkData.sort((a, b) => a - b);
    bookmarkData = bookmarkData.map((pageKey) => {
      return [pageKey + that.vars.xAxisScaleInSeconds / 2, 1];
    });

    (myFunction = function () {
      var popup = document.getElementById("myPopup");
      popup.classList.toggle("show");
    }),
      (that.vars.chart = new Highcharts.chart({
        boost: {
          // speed up
          enabled: true,
          seriesThreshold: 1,
        },
        chart: {
          animation: false,
          renderTo: that.vars.graphID,
          width: that.options.graph.width,
          height: graphHeight,
          marginTop: that.options.graph.marginTop,
          marginBottom: that.options.graph.marginBottom,
          marginLeft: that.options.graph.marginLeft,
          marginRight: that.options.graph.marginRight,
          backgroundColor: that.options.graph.backgroundColor,
          events: {
            load: function (event) {
              that._setupLabelHighlighting();
              // that._refreshAnnotations();
            },
            redraw: function (event) {
              that._setupLabelHighlighting();
              that._setupYAxisLinesAndLabels();
            },
          },
          //TODO: change how chart zooms, does not work well with annotations
          // zoomType: "xy",

          resetZoomButton: {
            position: {
              align: "left",
              verticalAlign: "bottom",
              x: -87.5,
              y: 25,
            },
            relativeTo: "plotBox",
          },
        },
        credits: {
          enabled: false,
        },
        title: {
          text: that.options.recordingName,
        },
        tooltip: {
          enabled: true,
          formatter: function () {
            var x = this.x;
            try {
              var annotation = that.vars.universalChangePointAnnotationsCache[
                that._getUniversalAnnotationIndexByXVal(x)
              ];
              var label;
              if (annotation !== undefined) {
                label = annotation.metadata.annotationLabel;
              }
              // console.log(label);
  
              return "Time Stamp: " + "<b>" + this.x + "</b>" + " s" + '<br/>' +
              "Previous Universal Change Point:" + "<br/>" + 
              "<b>" + label + "</b>";
            } catch {
              return "Error";
            }
          },
        },
        annotations: null,
        plotOptions: {
          series: {
            animation: false,
            turboThreshold: 0,
            boostThreshold: 1,
            type: "line",
            color: "black",
            lineWidth: that.options.graph.lineWidth,
            enableMouseTracking: that.options.graph.enableMouseTracking,
            stickyTracking: true,
            events: {
              // mouseOver: function (e) {
              // 	//	that._selectChannel(e.target.index);
              // },
              // mouseOut: function (e) {
              // 	//	that._unselectChannels();
              // },
            },
            point: {
              events: {
                click: function (e) {
                  var crosshairPosition = {
                    plotX: this.plotX,
                    plotY: this.plotY,
                    timeInSeconds: e.point.x,
                    channelName: e.point.series.name,
                    channelIndex: e.point.series.index,
                    dataId: e.point.series.options.custom.dataId,
                  };

                  that.vars.annotationCrosshairCurrPosition = ({...crosshairPosition});
                  that._setCrosshair(crosshairPosition);

                },
                // workaround to trigger click event handler on point under boost mode
                // https://github.com/highcharts/highcharts/issues/14067
                mouseOver: function () {
                  if (this.series.halo) {
                    this.series.halo
                      .attr({
                        class: "highcharts-tracker",
                      })
                      .toFront();
                  }
                },
              },
            },
          },
          line: {
            marker: {
              enabled: false,
            },
          },
          polygon: {},
        },
        navigator: {
          enabled: true,
          adaptToUpdatedData: true,
          height: 20,
          margin: 25,
          handles: {
            enabled: false,
          },
          xAxis: {
            labels: {
              formatter: that._formatXAxisLabel,
              style: {
                textOverflow: "none",
              },
            },
          },
          series: {
            type: "area",
            color: "#26a69a",
            fillOpacity: 1.0,
            lineWidth: 1,
            marker: {
              enabled: false,
            },
            data: bookmarkData,
          },
        },
        xAxis: {
          gridLineWidth: 1,
          labels: {
            enabled: that.options.showTimeLabels,
            crop: false,
            style: {
              textOverflow: "none",
            },
            step: that.vars.xAxisScaleInSeconds / 6,
            formatter: that._formatXAxisLabel,
          },
          tickInterval: 1,
          minorTickInterval: 0.5,
          min: that.vars.currentWindowStart,
          max: that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds,
          unit: [["second", 1]],
          events: {
            setExtremes: function (e) {
              if (e.trigger == "navigator") {
                var startTimeSnapped =
                  Math.round(e.min / that.vars.xAxisScaleInSeconds) *
                  that.vars.xAxisScaleInSeconds;
                startTimeSnapped = Math.max(0, startTimeSnapped);
                startTimeSnapped = Math.min(
                  that._getLatestPossibleWindowStartInSeconds(),
                  startTimeSnapped
                );
                that._switchToWindow(
                  that.options.allRecordings,
                  startTimeSnapped,
                  that.vars.xAxisScaleInSeconds
                );
                return false;
              }
            },
          },
        },
        yAxis: {
          tickInterval: 100,
          minorTickInterval: 50,
          min: -0.75 * that.options.graph.channelSpacing * 0.75,
          max: (channels.length - 0.25) * that.options.graph.channelSpacing,
          gridLineWidth: 0,
          minorGridLineWidth: 0,
          labels: {
            enabled: that.options.showChannelNames,
            step: 1,
            useHTML: true,
            formatter: function () {
              if (
                this.value < 0 ||
                this.value >
                  channels.length * that.options.graph.channelSpacing ||
                this.value % that.options.graph.channelSpacing !== 0
              ) {
                return null;
              }

              var index = that._getChannelIndexFromY(this.value);
              that.vars.allChannels = channels;
              var channel = channels[index];

              //that.vars.popUpActive = 1;

              var html =
                '<div class="popup"><span class="channel-label" id="channel-' +
                index +
                '" data-index="' +
                index +
                '">' +
                channel.name +
                /*' <span class="popuptext" id="myPopup-' +
								index +
								'">' +
								channel.name +
								": " +
								'<button class="popupbutton" id="increase-' +
								index +
								'">Increase Amplitude</button> <button class="popupbutton" id="decrease-' +
								index +
								'">Decrease Amplitude</button> <button class="popupbutton" id="default-' +
								index +
								'">Default</button></span>*/ "</span></div>";

              return html;
            },
          },
          title: {
            text: null,
          },
          scrollbar: {
            enabled: true,
            showFull: false,
          },
        },
        scrollbar: {
          liveRedraw: false,
        },
        legend: {
          enabled: false,
        },
        series: that._initSeries(data)
        //.push(
        //   {
        //     type : 'flags',
        //     data : [{
        //         x : 0,      // Point where the flag appears
        //         title : '', // Title of flag displayed on the chart 
        //         text : ''   // Text displayed when the flag are highlighted.
        //     }],
        //     onSeries : '',  // Id of which series it should be placed on. If not defined 
        //                     // the flag series will be put on the X axis
        //     shape : 'flag'  // Defines the shape of the flags.
        // }
        // )
        ,
        annotationsOptions: {
          enabledButtons: false,
        },
      }));

    if (that.options.features.examplesModeEnabled) {
      that._displayAnnotations(
        that._turnExamplesIntoAnnotations(that.options.features.examples)
      );
    }
    that._setupYAxisLinesAndLabels();
  },

  /*_changeAmplitude: function (index, channels) {
		var that = this;
    

        var check;
        var cid = "channel-" + index; // channel id
        console.log("channel-index:" + cid)
        var checker = that.vars.oldIndex;

        console.log("checker: " + checker)
        console.log("that.vars.oldIndex:" +that.vars.oldIndex)

        if(checker > -1){
            $("#increase-"+(checker)).css("visibility", "hidden");
            $("#decrease-"+(checker)).css("visibility", "hidden");
            $("#default-"+(checker)).css("visibility", "hidden");
            $("#myPopup-"+(checker)).css("visibility", "hidden");
            that.vars.oldIndex = -1;
        } 

        var channel = channels[index];
        console.log("channel: " + channel);

        check = that.vars.popUpActive;
        console.log("check: " + check)

        if(check == 1 ){
            $("#myPopup-"+(index)).css("visibility", "visible");
            $("#increase-"+(index)).css("visibility", "visible");
            $("#decrease-"+(index)).css("visibility", "visible");
            $("#default-"+(index)).css("visibility", "visible");
        }
        console.log("check: " + check)


        that.vars.popUpActive = 2;
        that.vars.oldIndex =index; // checks if any channel has been clicked before 
        var increaser = $("#increase-"+(index)).on('click', (evt) => {
            that.vars.valueOptions = 1;
            that.vars.increaseOnce = 1;
            that.vars.channelAmplitudeOnChange = { name: channel.name, dataId: channel.dataId };
            that.vars.reprint = 1;
            that._switchToWindow(that.options.allRecordings, that.vars.currentWindowStart, that.vars.xAxisScaleInSeconds);
          
    
        });
    
        var decreaser = $("#decrease-"+(index)).on('click', (evt) => {
            that.vars.valueOptions = -1;
            that.vars.channelAmplitudeOnChange = { name: channel.name, dataId: channel.dataId };
            that.vars.increaseOnce = 1;
            that.vars.reprint = 1;
            that._reloadCurrentWindow();

        });
        var defaulter = $("#default-"+(index)).on('click', (evt) => {
            that.vars.valueOptions = 0;
            that.vars.channelAmplitudeOnChange = { name: channel.name, dataId: channel.dataId };
            that.vars.reprint = 1;
            that._reloadCurrentWindow();
           
            
        });

        
	},*/

  _formatXAxisLabel: function () {
    // Format x-axis at HH:MM:SS
    var s = this.value;
    var h = Math.floor(s / 3600);
    s -= h * 3600;
    var m = Math.floor(s / 60);
    s -= m * 60;
    return h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s); //zero padding on minutes and seconds
  },

  _renderAlignmentAlert: function () {
    //create an alignment alert, alerting user to click psg first, red border
    //disable it and enable when psg is clicked

    var that = this;
    var alert = $("#alignment-alert");

    if (!that._isInCrosshairSyncMode()) {
      alert.hide();
      return;
    }

    let alertText;

    if (that.vars.crosshairPosition.length === 0) {
      alertText = "Please click on the PSG to align the graph.";
    } else {
      alertText = "Please click on the other montage to align the graph.";
    }

    alert.show();
    alert.html(alertText);
  },

  _myfunction: function () {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  },

  _blockGraphInteraction: function () {
    var that = this;
    var container = $(that.element);
    // //console.log(container);
    var graph = $("#" + that.vars.graphID);
    var blocker = $("<div>")
      .addClass("blocker")
      .css({
        position: "absolute",
        left: 0,
        width: "100%",
        top: graph.offset().top,
        height: graph.height(),
        backgroundColor: "rgba(0, 0, 0, 0)",
      })
      .appendTo(container);
  },

  _unblockGraphInteraction: function () {
    var that = this;
    $("> .blocker").remove();
  },

  _setupAnnotationInteraction: function () {
    var that = this;
    if (!that.vars.setupOn) {
      that.vars.setupOn = true;
    } else {
      // checks if the file is configured to be read only
      if (that.options.isReadOnly) {
        console.log("files is read only");
        return;
      }
      //   //console.log(that.options.features.order);
      if (!that.options.features.order || !that.options.features.order.length)
        return;
      var chart = that.vars.chart;
      //    //console.log(chart);

      // the container that the chart is in
      var container = chart.container;

      // drag function for box annotations.
      function drag(e) {
        var annotation,
          //gets the xy position of the mouse when you click
          clickX = e.pageX - container.offsetLeft,
          clickY = e.pageY - container.offsetTop;
        if (
          !chart.isInsidePlot(
            // if the moust is not inside the plot when you click, gets the leftmost position of the chart
            clickX - chart.plotLeft,
            clickY - chart.plotTop
          )
        ) {
          return;
        }

        //links the mousemove event with the step function defined later on
        Highcharts.addEvent(document, "mousemove", step);

        //links the mouseup event with the step function defined later on
        Highcharts.addEvent(document, "mouseup", drop);
        var annotationId = undefined;

        //gets the value of the mouse when you click on the graph
        var clickXValue = that._convertPixelsToValue(clickX, "x");
        var clickYValue = that._convertPixelsToValue(clickY, "y");
        //  //console.log(clickXValue);

        //gets the index of the channel that is being hovered over at the moment
        var channelIndexStart = that._getChannelIndexFromY(clickYValue);
        var channelIndices = [channelIndexStart];
        var featureType = that.vars.activeFeatureType;

        // adds an annotation box
        annotation = that._addAnnotationBox(
          annotationId,
          clickXValue,
          channelIndices,
          featureType
        );

        // checks which channels that the annotation is over
        function getAnnotationChannelIndices(e) {
          var y = e.clientY - container.offsetTop,
            dragYValue = that._convertPixelsToValue(y, "y"),
            channelIndices = that._getChannelsAnnotated(
              clickYValue,
              dragYValue
            );
          return channelIndices;
        }

        // gets relevant annotation information about the annotation
        function getAnnotationAttributes(e) {
          var x = e.clientX - container.offsetLeft,
            dx = x - clickX,
            width = that._convertPixelsToValueLength(parseInt(dx, 10) + 1, "x"),
            channelIndices = getAnnotationChannelIndices(e),
            { height, yValue } =
              that._getAnnotationBoxHeightAndYValueForChannelIndices(
                channelIndices
              );
          if (dx >= 0) {
            var xValue = that._convertPixelsToValue(clickX, "x");
          } else {
            var xValue = that._convertPixelsToValue(x, "x");
          }
          return {
            xValue: xValue,
            yValue: yValue,
            shape: {
              params: {
                width: width,
                height: height,
              },
            },
          };
        }


        // updates the annotation box with relevant channel indicies that it's selecting
        function step(e) {
          annotation.update(getAnnotationAttributes(e));
          annotation.metadata.channelIndices = getAnnotationChannelIndices(e);
        }

        function drop(e) {
          Highcharts.removeEvent(document, "mousemove", step);
          Highcharts.removeEvent(document, "mouseup", drop);
          var x = e.clientX - container.offsetLeft;
          if (x == clickX) {
            if (annotation && annotation.destroy) {
              annotation.destroy();
              $("html").off("mousedown", annotation.outsideClickHandler);
            }
            that.vars.chart.selectedAnnotation = null;
            return;
          }
          if (annotation) {
            annotation.update(getAnnotationAttributes(e));
          }
          annotation.outsideClickHandler = function () {
            // annotation.destroy();
            // $("html").off("mousedown", annotation.outsideClickHandler);
            // that.vars.chart.selectedAnnotation = null;
          };
          $("html").on("mousedown", annotation.outsideClickHandler);
        }
      }
      
      function click(e) {
        // if (that.vars.annotationClicks.clickOne === null) {
        //   (clickXOne = e.pageX - container.offsetLeft),
        //     (clickYOne = e.pageY - container.offsetTop);

        //   that.vars.annotationClicks.clickOne = {
        //     clickX: clickXOne,
        //     clickY: clickYOne,
        //   };
        // } else if (that.vars.annotationClicks.clickTwo === null) {
        //   (clickXTwo = e.pageX - container.offsetLeft),
        //     (clickYTwo = e.pageY - container.offsetTop);

        //   that.vars.annotationClicks.clickTwo = {
        //     clickX: clickXTwo,
        //     clickY: clickYTwo,
        //   };

        //   var annotation = that._addAnnotationChangePoint();

        //   that.vars.annotationClicks.clickOne = null;
        //   that.vars.annotationClicks.clickTwo = null;
        // }
        clickX = e.pageX - container.offsetLeft;
        clickY = e.pageY - container.offsetTop
        var annotation = that._addAnnotationChangePoint(clickX, clickY);

      }


      function clickAll(e) {
        clickX = e.pageX - container.offsetLeft;

        var annotation = that._addAnnotationChangePointAll(clickX, );

      }
      
      that.vars.annotationMode = that.options.features.annotationType;
      // Define behaviour of different types of annotation.
      if (that.options.features.annotationType == "box") {
        Highcharts.removeEvent(container, "mousedown");
        Highcharts.addEvent(container, "mousedown", drag);
      } else if (that.options.features.annotationType == "none") {
        // console.log("here");
        Highcharts.removeEvent(container, "mousedown");
      } else if (that.options.features.annotationType == "cpoint") {
        Highcharts.removeEvent(container, "mousedown");
        Highcharts.addEvent(container, "mousedown", click);
      } else if (that.options.features.annotationType == "cpointall") {
        Highcharts.removeEvent(container, "mousedown");
        Highcharts.addEvent(container, "mousedown", clickAll);
      // } else if (that.options.features.annotationType == "sne") {
      //   // Highcharts.removeEvent(container, "click");
      //   Highcharts.addEvent(container, "click", dropStartCrosshair);
      }
    }
  },

  _addAnnotationType: function (annotation) {
    var that = this;
    // get the channels by name
    const channelIndices = annotation.metadata.channelIndices;
    let channelLabels = [];

    channelIndices.forEach((index) => {
      const channelName = that.vars.allChannels[index].name;

      const currentLabel = that._getAnnotationLabel(channelName);

      if (currentLabel && currentLabel.length !== 0) {
        currentLabel.forEach((label) => {
          if (!channelLabels.includes(label)) {
            channelLabels.push(label);
          }
        });
      }
      // console.log(channelName);
      // channelLabels = [...channelLabels, that._getAnnotationLabel(channelName)];
    });

    return channelLabels;
  },

  _getAnnotationLabel: function (channelName) {
    var that = this;
    const currentMontage = that._getCurrentMontage();

    if (that.options.features.annotationType === "box") {
      switch (currentMontage) {
        case "PSG":
          switch (channelName) {
            case "F4-A1":
            case "C4-A1":
            case "O2-A1":
              return ["Aro"];

            case "LOC-A2":
            case "ROC-A1":
            case "Chin1-Chin2":
            case "ECG":
              return [];

            case "Leg/L":
            case "Leg/R":
              return ["LM"];

            case "Snore":
            case "Airflow":
            case "NasalPressure":
            case "Thor":
            case "Abdo":
              return ["H1", "H2", "OA", "CA", "MA"];

            case "SpO2":
              return ["desat"];
          }
          break;

        case "watchpath":
          switch (channelName) {
            case "VIEW_PAT":
            case "DERIVED_PAT_AMP":
            case "DERIVED_HR":
              return ["Aro"];

            case "SAO2_WRIST":
              return ["desat"];

            case "ACTIGRAPH":
            case "WRIST_STAGES":
              return [];
          }
          break;

        case "ANNE":
          switch (channelName) {
            case "ECG":
              return ["Arrhythmia"];

            case "AcclPtch":
            case "AcclRoll":
            case "RespEffort":
            case "PAT(ms)":
            case "PAT_resp":
            case "Snore":
              return ["Obs", "Cen", "Mix"];

            case "SpO2(%)":
              return ["desat"];

            case "Pleth":
            case "PAT_trend":
            case "HR(bpm)":
              return ["Aro"];

            case "ChestTemp":
            case "LimbTemp":
              return [];
          }
          break;

        case "MUSE":
          switch (channelName) {
            case "eeg-ch1 - eeg-ch2":
            case "eeg-ch4 - eeg-ch2":
            case "eeg-ch1":
            case "eeg-ch4":
            case "eeg-ch1-eeg-ch4":
            case "eeg-ch4-eeg-ch3":
            case "eeg-ch2":
            case "eeg-ch3":
            case "acc-ch1":
            case "acc-ch2":
            case "acc-ch3":
            case "ppg-ch2":
              return [];
          }

          break;

        case "Apnealink":
          switch (channelName) {
            case "Flow":
            case "Effort":
            case "Snoring":
              return ["Hyp", "Obs", "Cen", "Mix"];
            case "Saturation":
              return ["Desat"];
            case "Pulse":
              return ["Aro"];
          }
          break;

        case "GENEActiv":
          switch (channelName) {
            case "Temp":
            case "light":
            case "ENMO":
            case "z-angle":
              return ["Sleep Period", "Wake Period"];
          }
          break;

        case "AX3":
          switch (channelName) {
            case "Temp":
            case "ENMO":
            case "z-angle":
              return ["Sleep Period", "Wake Period"];
          }
          break;
//TODO: FIX THIS
        case "ANNE + PSG":
        case "PSG + ANNE":
          switch (channelName) {
            case "ECG":
            case "AcclPtch":
            case "AcclRoll":
            case "RespEffort":
            case "Snore":
            case "ECG":
            case "Thor":
            case "Abdo":
            case "Snore":
            case "Chin1-Chin2":
              return [];
          }
          break;

        case "MUSE + PSG":
        case "PSG + MUSE":
          switch (channelName) {
            case "eeg-ch1 - eeg-ch2":
            case "eeg-ch4 - eeg-ch2":
            case "eeg-ch1":
            case "eeg-ch4":
            case "eeg-ch1-eeg-ch4":
            case "eeg-ch4-eeg-ch3":
            case "acc-ch1":
            case "acc-ch2":
            case "acc-ch3":
            case "F4-A1":
            case "C4-A1":
            case "O2-A1":
            case "LOC-A2":
            case "ROC-A1":
            case "Chin1-Chin2":
              return [];
          }
          break;

        case "GENEActiv + PSG":
        case "PSG + GENEActiv":
          switch (channelName) {
            case "light":
            case "ENMO":
            case "z-angle":
            case "Chin1-Chin2":
            case "Leg/L":
            case "Leg/R":
              return [];
          }
          break;

        case "GENEActiv + Actical":
        case "Actical + GENEActiv":
          switch (channelName) {
            case "ENMO":
            case "z-angle":
            case "Counts":
              return [];
          }
      }
    } else if (that.options.features.annotationType === "cpoint") {
      console.log("here");
      console.log(currentMontage);
      switch (currentMontage) {
        case "PSG":
          switch (channelName) {
            case "F4-A1":
            case "C4-A1":
            case "O2-A1":
            case "LOC-A2":
            case "ROC-A1":
            case "Chin1-Chin2":
            case "ECG":
            case "Leg/L":
            case "Leg/R":
            case "Snore":
            case "Airflow":
            case "NasalPressure":
            case "Thor":
            case "Abdo":
            case "SpO2":
              return ["ok", "artif"];
          }
          break;

        case "watchpath":
          switch (channelName) {
            case "VIEW_PAT":
            case "DERIVED_PAT_AMP":
            case "DERIVED_HR":
            case "SAO2_WRIST":
            case "ACTIGRAPH":
              return ["ok", "artif"];
            case "WRIST_STAGES":
              return [];
          }
          break;

        case "ANNE":
          switch (channelName) {
            case "ECG":
            case "AcclPtch":
            case "AcclRoll":
            case "RespEffort":
            case "PAT(ms)":
            case "PAT_resp":
            case "Snore":
            case "SpO2(%)":
            case "Pleth":
            case "PAT_trend":
            case "HR(bpm)":
            case "ChestTemp":
            case "LimbTemp":
              return ["ok", "artif"];
          }
          break;

        case "MUSE":
          switch (channelName) {
            case "eeg-ch1 - eeg-ch2":
            case "eeg-ch4 - eeg-ch2":
            case "eeg-ch1":
            case "eeg-ch4":
            case "eeg-ch1-eeg-ch4":
            case "eeg-ch4-eeg-ch3":
            case "eeg-ch2":
            case "eeg-ch3":
            case "acc-ch1":
            case "acc-ch2":
            case "acc-ch3":
            case "ppg-ch2":
              return ["ok", "artif"];
          }

          break;

        case "Apnealink":
          switch (channelName) {
            case "Flow":
            case "Effort":
            case "Snoring":
            case "Saturation":
            case "Pulse":
              return ["ok", "artif"];
          }
          break;

        case "GENEActiv":
          switch (channelName) {
            case "Temp":
            case "light":
            case "ENMO":
            case "z-angle":
              return [];
          }
          break;

        case "AX3":
          switch (channelName) {
            case "Temp":
            case "ENMO":
            case "z-angle":
              return [];
          }
          break;

        case "ANNE + PSG":
        case "PSG + ANNE":
          switch (channelName) {
            case "ECG":
            case "AcclPtch":
            case "AcclRoll":
            case "RespEffort":
            case "Snore":
            case "ECG":
            case "Thor":
            case "Abdo":
            case "Snore":
            case "Chin1-Chin2":
              return [];
          }
          break;

        case "MUSE + PSG":
        case "PSG + MUSE":
          switch (channelName) {
            case "eeg-ch1 - eeg-ch2":
            case "eeg-ch4 - eeg-ch2":
            case "eeg-ch1":
            case "eeg-ch4":
            case "eeg-ch1-eeg-ch4":
            case "eeg-ch4-eeg-ch3":
            case "acc-ch1":
            case "acc-ch2":
            case "acc-ch3":
            case "F4-A1":
            case "C4-A1":
            case "O2-A1":
            case "LOC-A2":
            case "ROC-A1":
            case "Chin1-Chin2":
              return [];
          }
          break;

        case "GENEActiv + PSG":
        case "PSG + GENEActiv":
          switch (channelName) {
            case "light":
            case "ENMO":
            case "z-angle":
            case "Chin1-Chin2":
            case "Leg/L":
            case "Leg/R":
              return [];
          }
          break;

        case "GENEActiv + Actical":
        case "Actical + GENEActiv":
          switch (channelName) {
            case "ENMO":
            case "z-angle":
            case "Counts":
              return [];
          }
      }
    } else if (that.options.features.annotationType === "cpointall") {
      console.log("here " + currentMontage);
      switch (currentMontage) {
        case "PSG":
          switch (channelName) {
            case "F4-A1":
            case "C4-A1":
            case "O2-A1":
            case "LOC-A2":
            case "ROC-A1":
            case "Chin1-Chin2":
            case "ECG":
            case "Leg/L":
            case "Leg/R":
            case "Snore":
            case "Airflow":
            case "NasalPressure":
            case "Thor":
            case "Abdo":
            case "SpO2":
              return ["W", "N1", "N2", "N3", "artif"];
          }
          break;

        case "watchpath":
          switch (channelName) {
            case "VIEW_PAT":
            case "DERIVED_PAT_AMP":
            case "DERIVED_HR":
            case "SAO2_WRIST":
            case "ACTIGRAPH":
            case "WRIST_STAGES":
              return ["Sleep", "Wake", "Artif"];
          }
          break;

        case "ANNE":
          switch (channelName) {
            case "ECG":
            case "AcclPtch":
            case "AcclRoll":
            case "RespEffort":
            case "PAT(ms)":
            case "PAT_resp":
            case "Snore":
            case "SpO2(%)":
            case "Pleth":
            case "PAT_trend":
            case "HR(bpm)":
            case "ChestTemp":
            case "LimbTemp":
              return ["Sleep", "Wake", "Artif"];
          }
          break;

        case "MUSE":
          switch (channelName) {
            case "eeg-ch1 - eeg-ch2":
            case "eeg-ch4 - eeg-ch2":
            case "eeg-ch1":
            case "eeg-ch4":
            case "eeg-ch1-eeg-ch4":
            case "eeg-ch4-eeg-ch3":
            case "eeg-ch2":
            case "eeg-ch3":
            case "acc-ch1":
            case "acc-ch2":
            case "acc-ch3":
            case "ppg-ch2":
              return ["W", "N1", "N2", "N3", "artif"];
          }

          break;

        case "Apnealink":
          switch (channelName) {
            case "Flow":
            case "Effort":
            case "Snoring":
            case "Saturation":
            case "Pulse":
              return [];
          }
          break;

        case "GENEActiv":
          switch (channelName) {
            case "Temp":
            case "light":
            case "ENMO":
            case "z-angle":
              return ["Wear", "Nonwear"];
          }
          break;

        case "AX3":
          switch (channelName) {
            case "Temp":
            case "ENMO":
            case "z-angle":
              return ["Wear", "Nonwear"];
          }
          break;

        case "ANNE + PSG":
        case "PSG + ANNE":
          switch (channelName) {
            case "ECG":
            case "AcclPtch":
            case "AcclRoll":
            case "RespEffort":
            case "Snore":
            case "ECG":
            case "Thor":
            case "Abdo":
            case "Snore":
            case "Chin1-Chin2":
              return [];
          }
          break;

        case "MUSE + PSG":
        case "PSG + MUSE":
          switch (channelName) {
            case "eeg-ch1 - eeg-ch2":
            case "eeg-ch4 - eeg-ch2":
            case "eeg-ch1":
            case "eeg-ch4":
            case "eeg-ch1-eeg-ch4":
            case "eeg-ch4-eeg-ch3":
            case "acc-ch1":
            case "acc-ch2":
            case "acc-ch3":
            case "F4-A1":
            case "C4-A1":
            case "O2-A1":
            case "LOC-A2":
            case "ROC-A1":
            case "Chin1-Chin2":
              return [];
          }
          break;

        case "GENEActiv + PSG":
        case "PSG + GENEActiv":
          switch (channelName) {
            case "light":
            case "ENMO":
            case "z-angle":
            case "Chin1-Chin2":
            case "Leg/L":
            case "Leg/R":
              return [];
          }
          break;

        case "GENEActiv + Actical":
        case "Actical + GENEActiv":
          switch (channelName) {
            case "ENMO":
            case "z-angle":
            case "Counts":
              return [];
          }
      }
    }
  },

  _getAnnotationLabelFromdisplayType: function(annotation) {
    if (annotation.metadata.displayType == 'ChangePointAll') {
      return [undefined, "Awake", "N1", "N2", "SWS", "REM"];
    } else if (annotation.metadata.displayType == 'ChangePoint') {
      return [undefined, "Obstructive Apnea", "Central Apnea", "Obstructive Hypoapnea", "Central Hypoapnea", "Flow Limitation", "Cortical Arousal", "Autonomic Arousal", "Desat. Event", "Mixed Apnea", "Mixed Hypoapnea", "(unanalyzable)", "(end previous state)"];
    } else { 
      return [undefined, "Obstructive Apnea", "Central Apnea", "Obstructive Hypoapnea", "Central Hypoapnea", "Flow Limitation", "Cortical Arousal", "Autonomic Arousal", "Desat. Event", "Mixed Apnea", "Mixed Hypoapnea", "(unanalyzable)"]; 
    }
  },

  _getCurrentMontage: function () {
    var that = this;

    return that.vars.currentMontage;
  },

  _getAnnotationBoxHeightAndYValueForChannelIndices: function (channelIndices) {
    var that = this;

    if (!Array.isArray(channelIndices)) {
      channelIndices = [channelIndices];
    }

    //gets the minimum and maximum channel indicies
    var channelIndexMin = Math.min(...channelIndices);
    var channelIndexMax = Math.max(...channelIndices);

    var height =
      (Math.abs(channelIndexMax - channelIndexMin) + 1) *
      that.options.graph.channelSpacing;
    var yValue = that._getBorderTopForChannelIndex(channelIndexMin);

    return {
      height,
      yValue,
    };
  },

  //removes all box annotations from screen (they still exist in the backend)
  _removeAnnotationBox: function () {
    var that = this;
    if (that.vars.chart) {
      const annotations = that.vars.chart.annotations.allItems;
      // //console.log(annotations);
      for (let i = annotations.length - 1; i > -1; --i) {
        annotations[i].destroy();
      }
    }
  },

  _addAnnotationChangePoint: function (clickX, clickY) // annotationId,
  // timeStart,
  // channelIndices,
  // featureType,
  // timeEnd,
  // confidence,
  // comment,
  // annotationData
  {
    var that = this;

    // const clickXOne = that.vars.annotationClicks.clickOne.clickX;
    // const clickYOne = that.vars.annotationClicks.clickOne.clickY;

    // const clickXTwo = that.vars.annotationClicks.clickTwo.clickX;
    // const clickYTwo = that.vars.annotationClicks.clickTwo.clickY;

    // const clickXOneValue = that._convertPixelsToValue(clickXOne, "x");
    // const clickYOneValue = that._convertPixelsToValue(clickYOne, "y");

    // const clickXTwoValue = that._convertPixelsToValue(clickXTwo, "x");
    // const clickYTwoValue = that._convertPixelsToValue(clickYTwo, "y");

    // console.log(clickXOneValue, clickYOneValue, clickXTwoValue, clickYTwoValue);

    const clickXValue = that._convertPixelsToValue(clickX, "x");
    const clickYValue = that._convertPixelsToValue(clickY, "y");

    const channelIndex = that._getChannelIndexFromY(clickYValue);
    // console.log(that.vars.allChannels[channelIndex].name);
    const featureType = that.vars.activeFeatureType;

    // console.log("channel selected: " + channelIndex);
    // console.log("feature type: " + featureType);

    const annotationId = undefined;

    var annotation = that._addAnnotationBoxChangePoint(
      annotationId,
      clickXValue,
      [channelIndex],
      featureType,
    );
    if (!that.options.isReadOnly) {
      that._addCommentFormToAnnotationBox(annotation);
      // if (!preliminary) {
        // size = shapeParams;
        // that._addCommentFormToAnnotationBoxChangePoint(annotation);
      // }
    }

    // that._addCommentFormToAnnotationBox(annotation);

    return annotation;
  },

  _addCommentFormToAnnotationBoxChangePoint: function (annotation) {
    if (annotation.metadata.commentFormAdded) {
      return;
    }

    var that = this;
    var annotations = that.vars.chart.annotations.allItems;

    // console.log(annotation);
    var annotationElement = $(annotation.group.element);

    // annotationElement.attr({
    // 	"stroke-dasharray": "150,50",
    // 	"stroke": "red",
    // 	"stroke-width": "25",
    // 	"stroke-dashoffset": "-500",
    // });

    // To learn more about the foreignObject tag, see:
    // https://developer.mozilla.org/en/docs/Web/SVG/Element/foreignObject
    var htmlContext = $(
      document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    );

    annotationElement.append(htmlContext);

    htmlContext
      .attr({
        width: `${annotation.group.element.getBBox().width}`,
        height: `${annotation.metadata.channelIndices.length * that.options.graph.channelSpacing}`,
        // x: 0,
        // y: 20,
        zIndex: 10,
      })
      .mousedown(function (event) {
        event.stopPropagation();
      })
      .click(function (event) {
        event.stopPropagation();
      })
      // .dblclick(function (event) {
      //   event.stopPropagation();
      //   event.preventDefault();
      //   that._deleteAnnotation(annotation.id);
      // })
      ;

    var body = $("<body>")
      .addClass("comment toolbar")
      // .attr("xmlns", "http://www.w3.org/1999/xhtml");
      .attr({
        width: "100px",
        height: "100px",
        zIndex: 10,
      });

    // dont make form disappear when not hovering over
    body.mouseover(function (event) {
      event.stopPropagation();
    });

    var form = $("<form>");
    form.css({
      position: "absolute",
      // left:
      display: "flex",
      width: "100px",
      height: "100%",
      zIndex: 10,
    });

    //gets all the relevant labels based on annotation type
    const channelLabels = that._addAnnotationType(annotation);

    //create a select element using Jquery
    var annotationLabelSelector = $('<select class="form-control">').keydown(
      function (event) {
        event.stopPropagation();
      }
    )
    .keydown(function (event) {
    	event.stopPropagation();
    });
    // add the options to the select element

    channelLabels.forEach((label) => {
      annotationLabelSelector.append(
        $('<option value="' + label + '">' + label + "</option>")
      );
    });

    // //add margin top and bottom
    annotationLabelSelector.css({
      width: "100%",
      height: "50px",
      zIndex: 10,
    });

    //TODO:Label is saving to annotation object, now need to handle labels in all other annotation related functions, specifically the save annotation one
    //add selector to form
    form.append(annotationLabelSelector);

    //TODO: add annotation label handling
    var annotationLabel = annotation.metadata.annotationLabel;

    //make the selector show the current label if it exists
    if (annotationLabel) {
      annotationLabelSelector.val(annotationLabel);
    }

    annotationLabelSelector.change(function () {
      // console.log(event.target.value);
      // event.preventDefault();
      form.submit(function (event) {
        event.preventDefault();

        var annotationLabel = annotationLabelSelector.val();
        annotations
          .filter((a) => a.metadata.id == annotation.metadata.id)
          .forEach((a) => {
            a.metadata.annotationLabel = annotationLabel;

            //gets the label from the form selector
            $(a.group.element).find(".form-control").val(annotationLabel);
          });
        that._saveFeatureAnnotation(annotation);
      });
    });
    body.append(form);
    htmlContext.append(body);

    annotation.metadata.commentFormAdded = true;
  },

  _addAnnotationBoxChangePoint: function (
    annotationId,
    timeStart,
    channelIndices,
    featureType,
    timeEnd,
    confidence,
    comment,
    annotationData,
  ) {
    var that = this;

    that.vars.annotationIDSet.add(annotationId);
    // //console.log("anotater");
    // gets all the annotations
    var annotations = that.vars.chart.annotations.allItems;
    ////console.log(annotations);

    // makes the channelIndicies an array
    if (!Array.isArray(channelIndices)) {
      channelIndices = [channelIndices];
    }
    // if (
    //   annotations.some(
    //     // checks if the annotation already exists
    //     (a) =>
    //       a.metadata.id == annotationId &&
    //       (a.metadata.channelIndices == channelIndices ||
    //         (channelIndices.length == 1 &&
    //           a.metadata.channelIndices.indexOf(channelIndices[0]) > -1))
    //   )
    // ) {
    //   return;
    // }

    // // sets timeEnd to the end time if it is defined
    // var timeEnd = timeEnd !== undefined ? timeEnd : false;

    // // gets the annotation data if the annotationData is defined
    // var annotationData = annotationData !== undefined ? annotationData : {};

    // // checks if there is a timeEnd value
    // var preliminary = timeEnd === false;

    //gets the height and yvalues
    var { height, yValue } =
      that._getAnnotationBoxHeightAndYValueForChannelIndices(channelIndices);

    var shapeParams = {
      height: that._convertValueToPixelsLength(height, "y"), //the height of the annotation box
    };
    // console.log("height:" + height);

    // if there is a timeEnd value

    shapeParams.width = 2;
    shapeParams.strokeWidth = 2;
    shapeParams.fill = "rgba(255, 0, 0, 1)";
    shapeParams.stroke = "solid";

    // shapeParams.fill = "rgba(255,255,255,0.2)";
    // shapeParams.stroke = "rgba(0,0,0,12)";
    // shapeParams.strokeWidth = 10;
    // shapeParams["stroke-dasharray"] = `75px`;
    // shapeParams["stroke-dashoffset"] = "750px";
    

    //adds the annotation box to the chart
    that.vars.chart.addAnnotation({
      xValue: timeStart,
      yValue: yValue,
      allowDragX: true,
      allowDragY: false,
      anchorX: "left",
      anchorY: "top",

      shape: {
        type: "rect",
        units: "pixel",
        params: shapeParams,
      },

      labels: [{
        text: 'Max value'
    }],
      

      events: {
        mouseup: function (event) {
          var element = $(this.group.element);
          var annotation = this;
          element.mouseout(event => {
            that._saveFeatureAnnotation(annotation);
            element.off('mouseout');
            element.off('mouseup');
          });

          element
            .find('rect[shape-rendering="crispEdges"]')
            .last()
            .remove();
        },

        mouseover: function (event) {
          that.vars.selectedAnnotation = this;
        },

        mouseleave: function (event) {
          that.vars.selectedAnnotation = undefined;
        }

        // mouseout: function (event) {
        //   that._saveFeatureAnnotation(this);
        // }

        // dblclick: function (event) {
        //   // deletes the annotation on db click
        //   if (that.options.isReadOnly) return;
        //   event.preventDefault();
        //   var xMinFixed = that._getAnnotationXMinFixed(this);
        //   var xMaxFixed = that._getAnnotationXMaxFixed(this);
        //   var annotationId = annotation.metadata.id;
        //   var channelIndices = annotation.metadata.channelIndices;
        //   var channelsDisplayed = that._getChannelsDisplayed();
        //   if (annotation.metadata.originalData) {
        //     channelIndices = annotation.metadata.originalData.channels;
        //     channelsDisplayed =
        //       annotation.metadata.originalData.channels_displayed;
        //   }
        //   that._deleteAnnotation(
        //     annotationId,
        //     that.vars.currentWindowRecording,
        //     xMinFixed,
        //     xMaxFixed,
        //     channelIndices,
        //     channelsDisplayed
        //   );
        //   annotations
        //     .slice()
        //     .reverse()
        //     .filter((a) => a.metadata.id == annotationId)
        //     .forEach((a) => {
        //       a.destroy();
        //       that.vars.chart.selectedAnnotation = null;
        //     });
        // },
      },

    });

    // gets the last annotaion
    var annotation = annotations[annotations.length-1];
    // if (!preliminary) {
      // var classString = $(annotation.group.element).attr("class");
      // classString += " saved";
      // $(annotation.group.element).attr("class", classString);
    // }
    $(annotation.group.element).on("mousedown", function (event) {
      event.stopPropagation();
    });
    annotation.metadata = {
      id: annotationId,
      // featureType: featureType,
      channelIndices: channelIndices,
      comment: "",
    };

    // if (!preliminary) {
      annotation.metadata.confidence = confidence;
      annotation.metadata.comment = comment;
      annotation.metadata.originalData = annotationData;
    // }

    if (annotation.metadata.displayType === undefined) {
      annotation.metadata.displayType = 'ChangePoint';
    }

    that._saveFeatureAnnotation(annotation);
    that._addChangePointLabelRight(annotation);

    return annotation;
  },

  _addAnnotationChangePointAll: function (clickX, fromObject=false) {
    var that = this;

    let clickXOneValue;
    let clickXTwoValue;

    if (fromObject) {
      clickXOneValue = clickX;
      clickXTwoValue = clickX;
    } else {
      clickXOneValue = that._convertPixelsToValue(clickX, "x");
      clickXTwoValue = that._convertPixelsToValue(clickX, "x");
    }

    

    const channelIndices = [];

    for (let i = 0; i < that.vars.allChannels.length; i++) {
      channelIndices.push(i);
    }

    const featureType = that.vars.activeFeatureType;
    const annotationId = undefined;

    var annotation = that._addAnnotationBoxChangePoint(
      annotationId,
      clickXOneValue,
      channelIndices,
      featureType,
      clickXTwoValue,
    );
    annotation.metadata.displayType = 'ChangePointAll';
    that._addCommentFormToAnnotationBox(annotation);
    that._addChangePointLabelLeft(annotation);

    

    return annotation;
  },

  //TODO: some bug here
  _addAnnotationBox: function (
    annotationId,
    timeStart,
    channelIndices,
    featureType,
    timeEnd,
    confidence,
    comment,
    annotationData,
  ) {
    var that = this;
    // gets all the annotations
    var annotations = that.vars.chart.annotations.allItems;

    that.vars.annotationIDSet.add(annotationId);

    // makes the channelIndicies an array
    if (!Array.isArray(channelIndices)) {
      channelIndices = [channelIndices];
    }
    // if (
    //   annotations.some(
    //     // checks if the annotation already exists
    //     (a) =>
    //       a.metadata.id == annotationId &&
    //       (a.metadata.channelIndices == channelIndices ||
    //         (channelIndices.length == 1 &&
    //           a.metadata.channelIndices.indexOf(channelIndices[0]) > -1))
    //   )
    // ) {
    //   return;
    // }

    // sets timeEnd to the end time if it is defined
    var timeEnd = timeEnd !== undefined ? timeEnd : false;

    // gets the annotation data if the annotationData is defined
    var annotationData = annotationData !== undefined ? annotationData : {};

    // checks if there is a timeEnd value
    var preliminary = timeEnd === false;

    //gets the height and yvalues
    var { height, yValue } =
      that._getAnnotationBoxHeightAndYValueForChannelIndices(channelIndices);

    var shapeParams = {
      height: height, //the height of the annotation box
    };

    // if there is a timeEnd value
    // if (preliminary) {
      shapeParams.width = 0;
      shapeParams.fill = "rgba(255, 0, 0, 0.5)";

      // shapeParams.stroke = that._getFeatureColor(
      //   featureType,
      //   annotationData.is_answer
      // );

      shapeParams.strokeWidth = 10;
    // } else {
    //   shapeParams.width = timeEnd - timeStart;
    //   // shapeParams.fill = that._getFeatureColor(
    //   //   featureType,
    //   //   annotationData.is_answer,
    //   //   confidence
    //   // );
    //   shapeParams.fill = "rgba(255,0,0,1)";
    //   shapeParams.stroke = "transparent";
    //   shapeParams.strokeWidth = 0;
    // }



    //adds the annotation box to the chart
    that.vars.chart.addAnnotation({
      xValue: timeStart,
      yValue: yValue,
      allowDragX: preliminary,
      allowDragY: false,
      anchorX: "left",
      anchorY: "top",

      

      shape: {
        type: "rect",
        units: "values",
        params: shapeParams,
      },
      events: {

        mouseover: function (event) {
          that.vars.selectedAnnotation = this;
        },

        mouseleave: function (event) {
          that.vars.selectedAnnotation = undefined;
        },

        mouseup: function (event) {
          var element = $(this.group.element);
          var annotation = this;
          
          element.mouseout(event => {
            that._saveFeatureAnnotation(annotation);
            element.off('mouseout');
            element.off('mouseup');
          });

          element
            .find('rect[shape-rendering="crispEdges"]')
            .last()
            .remove()
          
          },

        // click: function (event) {
        //   that._saveFeatureAnnotation(this);
        // }
          

      },
    });
    // gets the last annotaion
    var annotation = annotations[annotations.length - 1];
    if (!preliminary) {
      var classString = $(annotation.group.element).attr("class");
      classString += " saved";
      $(annotation.group.element).attr("class", classString);
    }
    $(annotation.group.element).on("mousedown", function (event) {
      event.stopPropagation();
    });
    annotation.metadata = {
      id: annotationId,
      // featureType: featureType,
      channelIndices: channelIndices,
      comment: "",
    };

    if (!preliminary) {
      annotation.metadata.confidence = confidence;
      annotation.metadata.comment = comment;
      annotation.metadata.originalData = annotationData;
    }
    if (!that.options.isReadOnly && !annotationData.is_answer) {
      $("html").off("mousedown", annotation.outsideClickHandler);
      var classString = $(annotation.group.element).attr("class");
      classString += " saved";
      $(annotation.group.element).attr("class", classString);
      that._addCommentFormToAnnotationBox(annotation);
      // if (!preliminary) {
      //   size = shapeParams;
      //   that._addCommentFormToAnnotationBox(annotation, size);
      // }
    }
    // that._addCommentFormToAnnotationBox(annotation);
    // console.log(annotation);

    

    return annotation;
  },

  _addConfidenceLevelButtonsToAnnotationBox: function (annotation) {
    var that = this;
    var annotations = that.vars.chart.annotations.allItems;
    var annotationElement = $(annotation.group.element);
    // To learn more about the foreignObject tag, see:
    // https://developer.mozilla.org/en/docs/Web/SVG/Element/foreignObject
    var htmlContext = $(
      document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    );
    htmlContext
      .attr({
        width: 70,
        height: 25,
        x: 0,
        y: 0,
        zIndex: 2,
      })
      .mousedown(function (event) {
        event.stopPropagation();
      })
      .click(function (event) {
        event.stopPropagation();
      })
      .dblclick(function (event) {
        event.stopPropagation();
      });
    var body = $(document.createElement("body"))
      .addClass("toolbar confidence-buttons")
      .attr("xmlns", "http://www.w3.org/1999/xhtml");
    var buttonGroup = $("<form>");
    var buttonDefinitions = [
      {
        confidence: 0,
        class: "red",
      },
      {
        confidence: 0.5,
        class: "yellow",
      },
      {
        confidence: 1,
        class: "light-green",
      },
    ];
    buttonDefinitions.forEach((buttonDefinition) => {
      var button = $("<div>")
        .addClass("btn")
        .addClass(buttonDefinition.class)
        .addClass(
          buttonDefinition.confidence == annotation.metadata.confidence
            ? "active"
            : ""
        )
        .data("confidence", buttonDefinition.confidence)
        .click(function (event) {
          var confidence = $(this).data("confidence");
          // var newColor = that._getFeatureColor(
          //   annotation.metadata.featureType,
          //   false,
          //   confidence
          // );
          annotations
            .filter((a) => a.metadata.id == annotation.metadata.id)
            .forEach((a) => {
              a.metadata.confidence = confidence;
              $(a.group.element)
                .find(".toolbar.confidence-buttons .btn")
                .each(function () {
                  if ($(this).data("confidence") === confidence) {
                    $(this).addClass("active").siblings().removeClass("active");
                  }
                });
              a.update({
                allowDragX: false,
                shape: {
                  params: {
                    strokeWidth: 0,
                    stroke: "solid",
                    // fill: newColor,
                  },
                },
              });
            });
          that._saveFeatureAnnotation(annotation);
          $("html").off("mousedown", annotation.outsideClickHandler);
          var classString = $(annotation.group.element).attr("class");
          classString += " saved";
          $(annotation.group.element).attr("class", classString);
          that._addCommentFormToAnnotationBox(annotation);
        });
      buttonGroup.append(button);
    });
    body.append(buttonGroup);
    htmlContext.append(body);
    annotationElement.append(htmlContext);
  },

  // sets up the GUI for the comment form for the annotations
  _addStageButtonsToAnnotationBox: function (annotation) {
    var that = this;
    var annotations = that.vars.chart.annotations.allItems;
    var annotationElement = $(annotation.group.element);
    // To learn more about the foreignObject tag, see:
    // https://developer.mozilla.org/en/docs/Web/SVG/Element/foreignObject
    var htmlContext = $(
      document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    );
    htmlContext
      .attr({
        width: 70,
        height: 25,
        x: 0,
        y: 0,
        zIndex: 2,
      })
      .mousedown(function (event) {
        event.stopPropagation();
      })
      .click(function (event) {
        event.stopPropagation();
      })
      .dblclick(function (event) {
        event.stopPropagation();
      });
    var body = $(document.createElement("body"))
      .addClass("toolbar confidence-buttons")
      .attr("xmlns", "http://www.w3.org/1999/xhtml");
    var buttonGroup = $("<form>");
    var buttonDefinitions = [
      {
        confidence: 0,
        class: "red",
      },
      {
        confidence: 0.5,
        class: "yellow",
      },
      {
        confidence: 1,
        class: "light-green",
      },
    ];
    buttonDefinitions.forEach((buttonDefinition) => {
      var button = $("<div>")
        .addClass("btn")
        .addClass(buttonDefinition.class)
        .addClass(
          buttonDefinition.confidence == annotation.metadata.confidence
            ? "active"
            : ""
        )
        .data("confidence", buttonDefinition.confidence)
        .click(function (event) {
          var confidence = $(this).data("confidence");
          var newColor = that._getFeatureColor(
            annotation.metadata.featureType,
            false,
            confidence
          );
          annotations
            .filter((a) => a.metadata.id == annotation.metadata.id)
            .forEach((a) => {
              a.metadata.confidence = confidence;
              $(a.group.element)
                .find(".toolbar.confidence-buttons .btn")
                .each(function () {
                  if ($(this).data("confidence") === confidence) {
                    $(this).addClass("active").siblings().removeClass("active");
                  }
                });
              a.update({
                allowDragX: false,
                shape: {
                  params: {
                    strokeWidth: 0,
                    stroke: "solid",
                    fill: newColor,
                  },
                },
              });
            });
          that._saveFeatureAnnotation(annotation);
          $("html").off("mousedown", annotation.outsideClickHandler);
          var classString = $(annotation.group.element).attr("class");
          classString += " saved";
          $(annotation.group.element).attr("class", classString);
          that._addCommentFormToAnnotationBox(annotation);
        });
      buttonGroup.append(button);
    });
    body.append(buttonGroup);
    htmlContext.append(body);
    annotationElement.append(htmlContext);
  },

  // adds a comment form
  _addCommentFormToAnnotationBox: function (annotation) {
    if (annotation.metadata.commentFormAdded) {
      return;
    }

    var that = this;
    var annotations = that.vars.chart.annotations.allItems;

    // console.log(annotation);
    var annotationElement = $(annotation.group.element);

    // To learn more about the foreignObject tag, see:
    // https://developer.mozilla.org/en/docs/Web/SVG/Element/foreignObject
    var htmlContext = $(
      document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    );
    
    // htmlContext.hide();
    htmlContext
      .attr({
        width: 120,
        height: 70,
        zIndex: 1,
      })
      .mousedown(function (event) {
        event.stopPropagation();
      })
      .click(function (event) {
        event.stopPropagation();
      });
    
    annotationElement.append(htmlContext);

    
    var body = $("<body>").addClass("comment toolbar");
    // .attr("xmlns", "http://www.w3.org/1999/xhtml");
    // .attr({
    // 	"width": "100%",
    // 	"height": "100%"
    // })
    body.css({zIndex: 10});

    $('.highcharts-annotation')  
      .mouseenter(function (event) {
        $("body[class='comment toolbar']").show();
      })
      .mouseleave(function (event) {
        $("body[class='comment toolbar']").hide();
      });

    

    var form = $("<form>");
    form.css({
      position: "absolute",
      top: "0%",
      // left:
      display: "table",
      width: "100%",
      height: "100%",
      // maxWidth: "100%",
      maxHeight: "100px",
      zIndex: 1,
    });
    

    // Buttons
    var toggleButton = $(
      '<button type="submit" class="btn btn-primary fa fa-pencil"></button>'
    );

    var trashButton = $(
      '<button type="reset" class="btn btn-primary fa fa-trash"></button>'
    );

    //gets all the relevant labels based on annotation type
    // const channelLabels = that._addAnnotationType(annotation);
    const channelLabels = that._getAnnotationLabelFromdisplayType(annotation);

    //create a select element using Jquery
    var annotationLabelSelector = $('<select class="form-control">')
      .hide()
      .keydown(function (event) {
        event.stopPropagation();
      })
      .css({zIndex: 1});
    //add the options to the select element

    channelLabels.forEach((label) => {
      annotationLabelSelector.append(
        $('<option value="' + label + '">' + label + "</option>")
      ).css({zIndex: 1});
    });

    // //add margin top and bottom
    annotationLabelSelector.css({
      width: "100%",
      height: "25%",
      padding: "1%",
      zIndex: 1,
    });

    //TODO:Label is saving to annotation object, now need to handle labels in all other annotation related functions, specifically the save annotation one
    form.append(toggleButton);
    form.append(trashButton);
    
    
    //add selector to form
    form.append(annotationLabelSelector);

    var comment = annotation.metadata.comment;

    if (comment === undefined) {
      comment = " ";
    }

    //TODO: add annotation label handling
    var annotationLabel = annotation.metadata.annotationLabel;

    //make the selector show the current label if it exists
    if (annotationLabel) {
      annotationLabelSelector.val(annotationLabel);
    }

    var input = $(
      '<input type="textbox" placeholder="Your comment..." value="' +
        comment +
        '">'
    )
      .hide()
      .css({
        width: "100%",
        height: "100%",
        padding: "1%",
        zIndex: 1,
      })
      .keydown(function (event) {
        event.stopPropagation();
      });

    form.submit(function (event) {
      event.preventDefault();
      var collapsed = toggleButton.hasClass("fa-pencil");
      if (collapsed) {
        toggleButton.removeClass("fa-pencil").addClass("fa-floppy-o");
        input.show().focus();
        annotationLabelSelector.show();
        $(".changePointLabelRight").hide();
        $(".changePointLabelLeft").hide();
        that.vars.chart.tooltip.label.hide();

      } else {


        //////
        $(".changePointLabelRight").show();
        $(".changePointLabelLeft").show();

        toggleButton.removeClass("fa-floppy-o").addClass("fa-pencil");
        input.hide();
        annotationLabelSelector.hide();
        var comment = input.val();
        var annotationLabel = annotationLabelSelector.val();
        toggleButton.focus();
        annotations
          .filter((a) => a.metadata.id == annotation.metadata.id)
          .forEach((a) => {
            a.metadata.comment = comment;
            a.metadata.annotationLabel = annotationLabel;
            $(a.group.element).find(".toolbar.comment input").val(comment);

            //gets the label from the form selector
            $(a.group.element).find(".form-control").val(annotationLabel);
          });
        that._saveFeatureAnnotation(annotation);
        that.vars.chart.tooltip.label.show();
      }
    });

    form.on('reset', function (event) {
      event.preventDefault();
      if (that.options.isReadOnly) return;
      
      var index = that._getUniversalAnnotationIndexByXVal(that._getAnnotationXMinFixed(annotation)) + 1;
      var nextAnnotation = that.vars.universalChangePointAnnotationsCache[index];
      
      that._nukeAnnotation(annotation);

      that._getNonTrivialUniversalAnnotations();
      if (nextAnnotation !== undefined) {
        that._updateChangePointLabelLeft(nextAnnotation);
        that._updateChangePointLabelRight(nextAnnotation);
      }
    });

    form.append(input);
    body.append(form);
    htmlContext.append(body);

    annotation.metadata.commentFormAdded = true;
  },

  _getChangePointColor: function (changePoint) {
    switch(changePoint) {
      // Sleep stages
      case "Awake":
        return "lightgreen";
      case "N1":
        return "aquamarine"
      case "N2":
        return "cyan";
      case "SWS":
        return "mediumturquoise";
      case "REM":
        return "deepskyblue";
      default:
      // Apnea and Hypoapnea
        if (changePoint) {
          if (changePoint.includes("Apnea")) {
            return "yellow";
          } else if (changePoint.includes("Hypoapnea")) {
            return "orange";
          } else if (changePoint.includes("Arousal")) {
            return "gold";
          } else if (changePoint == "Desat. Event" || changePoint == "Flow Limitation" ) {
            return "lightsalmon";
          } else if (changePoint == "(end previous state)") {
            return "white";
          }
        }
        return "red";
    }

  },

  _addChangePointLabelFixed: function () {
    var that = this;
    let chart = that.vars.chart;

    var annotations = that._getNonTrivialUniversalAnnotations();
    // grab the previous annotation in sorted order
    var index = that._getUniversalAnnotationIndexByXVal(that.vars.currentWindowStart);
    var annotation = annotations[index];
    var label;
    if (annotation !== undefined) {
      label = annotation.metadata.annotationLabel;
    }
    label = label || 'undefined';

    const x = 0;
    const y = 0;
    const height = 26;
    const width = 200 + that._getTextWidth(label, 12);
    var content = `<div id="prevPageLatestLabel">Latest Stage Change Previous Page: <b>` + label
    + '</b></div>';

    chart.renderer.html(content, x+7.5, y+17)
      .attr({
        zIndex: 5,
        id: 'prevPageLatestLabel'
      })
      .css({                                 
        'font-size': 12,
        'color': 'white'
      })
      .add();


    chart.renderer.rect(x, y, width, height, 0)
      .attr({
        'stroke-width': 0.5,
        stroke: 'black',
        fill: '#26a69a',
        zIndex: 4,
        id: 'prevPageLatestBox'
      })
      .add();
  },

  _addChangePointLabelLeft: function (annotation) {
  // Adds the left label tag denoting the pervious state to the bottom of a change point annotation.

    var that = this;
    // var annotations = that.vars.chart.annotations.allItems;

    var annotationElement = $(annotation.group.element);

    var htmlContext = $(
      document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
    );
    // htmlContext.hide();
    
    var textarea1 = $(`<textarea rows="1" cols="20" id=${annotation.metadata.id}Left>`);
    textarea1.css({
      position: "relative",
      display: "table",
      width: "100%",
      height: "100%",
      backgroundColor: "red",
      zIndex: 0,
      "white-space": "nowrap"
    });

    var annotationHeight = that._convertValueToPixelsLength(that.options.graph.channelSpacing) * annotation.metadata.channelIndices.length;

    annotationElement.append(htmlContext);
    const height = 26;
    width = that._getTextWidth(annotation.metadata.annotationLabel);
    htmlContext
      .attr({
        width: width,
        height: height,
        zIndex: 0,
        y: annotationHeight - height,
        // y: `${annotation.group.element.getBBox().height-height}`,
        x: -width,
      })
    
    var index = that._getUniversalAnnotationIndexByXVal(that._getAnnotationXMinFixed(annotation)) ;
    // var annotations = that.vars.universalChangePointAnnotationsCache;
    var annotations = that._getNonTrivialUniversalAnnotations();
  
    if (annotations.length != 0 && index >=0) {
      textarea1.val(annotations[index].metadata.annotationLabel);
    } else {
      textarea1.val("");
    }
    
    var body = $("<body>").addClass("changePointLabelLeft");
    body.css({zIndex: 10});

    body.append(textarea1);
    htmlContext.append(body);
  },

  

  _addChangePointLabelRight: function (annotation) {
    // Adds the right label tag denoting the new state to the bottom of a change point annotation.
  
      var that = this;
      // var annotations = that.vars.chart.annotations.allItems;
  
      var annotationElement = $(annotation.group.element);
  
      var htmlContext = $(
        document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
      );
      // htmlContext.hide();

      
      var textarea = $(`<textarea rows="1" cols="20" id=${annotation.metadata.id}Right>`);
      textarea.css({
        position: "relative",
        display: "table",
        width: "100%",
        height: "100%",
        backgroundColor: "red",
        zIndex: 0,
        "white-space": "nowrap"
      });

      textarea.val(annotation.metadata.annotationLabel);
      
      var annotationHeight = that._convertValueToPixelsLength(that.options.graph.channelSpacing) * annotation.metadata.channelIndices.length;

      annotationElement.append(htmlContext);
      const height = 26;
      width = that._getTextWidth(annotation.metadata.annotationLabel);
      htmlContext
        .attr({
          width: width,
          height: height,
          zIndex: 0,
          // y: `${annotation.group.element.getBBox().height-height}`,
          y: annotationHeight - height,
          x: 2,
        });
      
  
      var body = $("<body>").addClass("changePointLabelRight");
      body.css({zIndex: 0});
  
      body.append(textarea);
      htmlContext.append(body);
  },

  _getTextWidth: function (text, font) {
    var f = font || '12px arial',
      o = $('<div></div>')
            .text(text)
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();
    o.remove();

    if (w != 0) {w+=6;}

    return w;
  },

  _addBoxControlPoint: function (annotation) {
    // Adds the right label tag denoting the new state to the bottom of a change point annotation.
  
      var that = this;
      // var annotations = that.vars.chart.annotations.allItems;
  
      var annotationElement = $(annotation.group.element);
  
      var htmlContext = $(
        document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
      );

      var textarea1 = $(`<textarea rows="1" cols="20" id=${annotation.metadata.id}ControlPoint>`);
      textarea1.css({
        position: "relative",
        display: "table",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        zIndex: 10,
        cursor: "grab",
        "white-space": "nowrap",
        "border-width": "thin"
      });

      // drag function for box annotations.
      var chart = that.vars.chart;
      var doc = $(document);

      // the container that the chart is in
      var container = chart.container;
      function drag(e) {
        e.preventDefault();
        e.stopPropagation();
        //links the mousemove event with the step function defined later on
        // Highcharts.addEvent(document, "mousemove", step);
        doc.mousemove( function(e) {
          e.preventDefault();
          e.stopPropagation();
          annotation.update(getAnnotationAttributes(e));
          that._updateControlPoint(annotation);
        });

        doc.mouseup(function(e) {
          e.preventDefault();
          e.stopPropagation();
          doc.off('mousemove');
          doc.off('mouseup');
          
          var x = e.clientX - container.offsetLeft;

          if (annotation) {
            annotation.update(getAnnotationAttributes(e));
            that._updateControlPoint(annotation);
          }
          annotation.outsideClickHandler = function () {};
          $("html").on("mousedown", annotation.outsideClickHandler);
        });
        

        // gets relevant annotation information about the annotation
        function getAnnotationAttributes(e) {
          var x = e.clientX - container.offsetLeft,
          width = that._convertPixelsToValue(parseFloat(x), "x")- annotation.options.xValue;

          if (width < 0) {
            width = 0.001;
          }

          return {
            shape: {
              xValue: annotation.options.xValue,
              params: {
                width: width,
                height: annotation.options.shape.params.height,
              },
            },
          };
        }

        // updates the annotation box with relevant channel indicies that it's selecting
      }

      textarea1.mouseover(function(e) {
        e.preventDefault();
        e.stopPropagation();
        textarea1.mousedown(function(e){
          drag(e);
        }) ;

      });
      annotationElement.append(htmlContext);

      var annotationHeight = that._convertValueToPixelsLength(that.options.graph.channelSpacing) * annotation.metadata.channelIndices.length;

      const height = 10;
      const width = 10;

      htmlContext
        .attr({
          width: width,
          height: height,
          zIndex: 0,
          // y: `${annotation.group.element.getBBox().height-height}`,
          y: annotationHeight / 2 - height,
          x: that._convertValueToPixelsLength(annotation.options.shape.params.width, "x") - width/2,
        });
      
  
      var body = $("<body>").addClass("controlPoint");
      body.css({zIndex: 0});
  
      body.append(textarea1);
      htmlContext.append(body);
      annotation.metadata.controlPointAdded = true;
  },

  _updateControlPoint: function (annotation) {
    var that = this;
    var annotationHeight = that._convertValueToPixelsLength(that.options.graph.channelSpacing) * annotation.metadata.channelIndices.length;

    const height = 10;
    const width = 10;

    var element = $(`#${annotation.metadata.id}ControlPoint`);
    element.parent().parent().attr(
        {
          width: width,
          height: height,
          zIndex: 0,
          y: annotationHeight / 2 - height,
          x: that._convertValueToPixelsLength(annotation.options.shape.params.width, "x") - width/2,
        }
    )

  },

  _getTextWidth: function (text, font) {
    var f = font || '12px arial',
      o = $('<div></div>')
            .text(text)
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();
    o.remove();

    if (w != 0) {w+=6;}

    return w;
  },
  
  _updateChangePointLabelFixed: function () {
    var that = this;
    let chart = that.vars.chart;

    var annotations = that._getNonTrivialUniversalAnnotations();
    // grab the previous annotation in sorted order
    var index = that._getUniversalAnnotationIndexByXVal(that.vars.currentWindowStart);
    var annotation = annotations[index];
    var label;
    if (annotation != undefined) {
      label = annotation.metadata.annotationLabel;
    }
    label = label || 'undefined';

    const x = 0;
    const y = 0;
    const height = 26;
    const width = 200 + that._getTextWidth(label, 12);

    var text = $(`#prevPageLatestLabel`);
    var content = `Latest Change Point Previous Page: <b>` + label + '</b>';
    text.html(content);

    var box = $(`#prevPageLatestBox`);
    box.attr({
      width: width,
    });
  },

  _updateChangePointLabelLeft: function (annotation) {
    var that = this;
    // var annotations = that.vars.universalChangePointAnnotationsCache;
    var annotations = that._getNonTrivialUniversalAnnotations();
    // grab the previous annotation in sorted order
    var index = that._getUniversalAnnotationIndexByXVal(that._getAnnotationXMinFixed(annotation)) - 1;
    

    var element = $(`#${annotation.metadata.id}Left`);

    if (annotations.length != 0 && index >= 0) {
      var label = annotations[index].metadata.annotationLabel;
      element.val(label);
      element.css({backgroundColor: that._getChangePointColor(label)});
      var width = that._getTextWidth(label, element.css('font'));
      element.parent().parent().attr({width: width, x: -width,});
    } else {
      element.val("");
      element.parent().parent().attr({width: 0, x: 0,});
    }

    
    
  },

  _updateChangePointLabelRight: function (annotation) {
    var that = this;
    var label = annotation.metadata.annotationLabel;
    const height = 26;
    var annotationHeight = that._convertValueToPixelsLength(that.options.graph.channelSpacing) * annotation.metadata.channelIndices.length;
    // console.log(label);
    var element = $(`#${annotation.metadata.id}Right`);
    element.val(label);
    element.css({backgroundColor: that._getChangePointColor(label)});
    // console.log(element);
    var width = that._getTextWidth(label, element.css('font'));
    element.parent().parent()
    .attr({width: width,
           y: annotationHeight - height,
      });

    // move label to the left if it is "(end previous state)"
    if (label == "(end previous state)") {
      element.parent().parent().attr({x: -width});
    }
  },

  _saveFeatureAnnotation: function (annotation) {
    var that = this;
    
    var annotationId = annotation.metadata.id;
    var type = annotation.metadata.featureType;
    var time_start = that._getAnnotationXMinFixed(annotation);
    var time_end = that._getAnnotationXMaxFixed(annotation);
    // console.log(time_start);
    // console.log(time_end);
    var channel = annotation.metadata.channelIndices;
    var confidence = annotation.metadata.confidence;
    var comment = annotation.metadata.comment;
    var rationale = undefined;
    var metadata = {};
    //TODO: add label handling
    var annotationLabel = annotation.metadata.annotationLabel;

    if (that._isHITModeEnabled()) {
      metadata = {
        visibleRegion: that.options.visibleRegion,
        windowSizeInSeconds: that.vars.xAxisScaleInSeconds,
        isTrainingWindow: that._isCurrentWindowTrainingWindow(),
      };
      if (that.options.projectUUID) {
        metadata.projectUUID = that.options.projectUUID;
      }
    }
    if (annotation.metadata.creator===undefined) {
      annotation.metadata.creator = Meteor.userId();
    }
    

    that._saveAnnotation(
      annotationId,
      that.vars.currentWindowRecording,
      type,
      time_start,
      time_end,
      channel,
      confidence,
      comment,
      metadata,
      annotationLabel,
      rationale,
      function (savedAnnotation, error) {
        if (savedAnnotation) {
          annotation.metadata.id = savedAnnotation.id;
          annotationFormatted = savedAnnotation.value;
          annotationFormatted.id = savedAnnotation.id;
          annotationFormatted.arbitration = savedAnnotation.arbitration;
          annotationFormatted.arbitrationRoundNumber =
            savedAnnotation.arbitrationRoundNumber;
          annotationFormatted.rationale = savedAnnotation.rationale;
          // that._displayAnnotations([annotationFormatted]);
          
        }
      },
    );
    // var element = $(`#${annotation.metadata.id}Right`);
    // if (annotation.metadata.displayType == 'ChangePoint' && 
    // annotation.metadata.annotationLabel == "(end previous state)") {
    //   if (element.length) {
    //     element.hide();
    //   }
    // } else if (annotation.metadata.displayType == 'ChangePoint' && 
    // annotation.metadata.annotationLabel != "(end previous state)") {
    //   if (!(element.length)) {
    //     element.show();
    //   }
    // }

    if (annotation.metadata.displayType === undefined) {
      that._addChangePointLabelRight(annotation);
      annotation.metadata.displayType = "Box";
      console.log(annotation.metadata.id);
    }

    if (annotation.metadata.displayType === "Box") {
      if (!annotation.metadata.controlPointAdded) {
        that._addBoxControlPoint(annotation);
      }
      that._updateControlPoint(annotation);
    }


    // convert changepoint annotations to box annotations where neccesary.
    if (annotation.metadata.annotationLabel == '(end previous state)') {
      that._convertChangePointsToBox(annotation);
    }


    // if (annotation.metadata.displayType == 'ChangePoint' || annotation.metadata.displayType == 'ChangePointAll') {
      that._updateChangePointLabelRight(annotation);
    // }
    if (annotation.metadata.displayType == 'ChangePointAll') {
      that._updateChangePointLabelLeft(annotation);

      var index = that._getUniversalAnnotationIndexByXVal(that._getAnnotationXMinFixed(annotation)) + 1;
      var annotations = that._getNonTrivialUniversalAnnotations();
      if (annotations[index] != undefined) {
        that._updateChangePointLabelLeft(annotations[index]);
      }
    }

    if (annotation.metadata.creator !== Meteor.userId()) {
      let fillColor = annotation.metadata.displayType == "Box" ? that._stringToColour(annotation.metadata.creator)+"50" :
      that._stringToColour(annotation.metadata.creator);
      annotation.update({
        shape: { 
          params: {
            fill: fillColor
          }
        }
      })
    }

    if (annotation.metadata.displayType === "Box" && 
    annotation.metadata.annotationLabel != undefined &&
    annotation.metadata.annotationLabel != "undefined" &&
    annotation.metadata.annotationLabel != "(unanalyzable)" &&
    annotation.metadata.channelIndices.length != that.vars.allChannels.length) {
      annotation.metadata.channelIndices = that.vars.allChannels.map((element, index) => index);
      annotation.update({
        xValue: annotation.options.xValue,
        yValue: that._getBorderTopForChannelIndex(0),
        shape: {
          params: {
            width: annotation.options.shape.params.width,
            height: that.options.graph.channelSpacing * annotation.metadata.channelIndices.length,
          },
        },
      })
      that._saveFeatureAnnotation(annotation);
    }

    // console.log(that.vars.universalChangePointAnnotations.map(a => that._getAnnotationXMinFixed(a)));
    console.log(annotation);
    // console.log(that.vars.universalChangePointAnnotationsCache.map(a => that._getAnnotationXMinFixed(a)));
  },

  _nukeAnnotation: function (annotation) {
    // deletes the annotation as well as the rendering.
    var that = this;
    var annotations = that.vars.chart.annotations.allItems;
    annotations
        .slice()
        .reverse()
        .filter((a) => a.metadata.id == annotation.metadata.id)
        .forEach((a) => {
          a.destroy();
          that.vars.chart.selectedAnnotation = null;
        });
      that._deleteAnnotation(
        annotation.metadata.id,
      );
  },

  _convertChangePointsToBox: function (annotation) {
    var that = this;
    var allAnnotations = that.vars.chart.annotations.allItems;
    allAnnotations.sort((a, b) => {
      return a.options.xValue - b.options.xValue;
    });

    allAnnotations.every( element => {

        // console.log(element);
        // console.log(element.metadata.displayType == 'ChangePoint');
        // console.log(element.options.xValue < annotation.options.xValue);
        // console.log(element.metadata.annotationLabel != undefined && element.metadata.annotationLabel != '(end previous state)');
        if (
          element.metadata.displayType == 'ChangePoint' &&
          element.options.xValue < annotation.options.xValue &&
          element.metadata.annotationLabel != undefined && element.metadata.annotationLabel != '(end previous state)'
        ) {

          let newAnnotation = that._addAnnotationBox(
            undefined,
            element.options.xValue,
            element.metadata.channelIndices,
            undefined,
            // undefined,
            // element.metadata.comment || annotation.metadata.comment,
            // annotation
            );

          // console.log(newAnnotation);
          
          newAnnotation.update({
            xValue: element.options.xValue,
            yValue: element.options.yValue,
            shape: {
              params: {
                width: annotation.options.xValue - element.options.xValue,
                height: that.options.graph.channelSpacing * element.metadata.channelIndices.length,
              },
            },
          })
          // let id = element.metadata.id;
          newAnnotation.metadata.annotationLabel = element.metadata.annotationLabel;
          that._nukeAnnotation(element);
          // newAnnotation.metadata.id = id;
          that._saveFeatureAnnotation(newAnnotation);
          // newAnnotation.metadata.displayType = 'Box';
          // that._updateChangePointLabelRight(newAnnotation);
      
          return false;
        }
        return true;
      }
    )
    that._nukeAnnotation(annotation);
  },

  _getUniversalAnnotationIndexByXVal: function (XVal) {
    // returns the index of annotation with XVal in that.vars.universalChangePointAnnotations
    // if the an annotation with this XVal does not exist, return the greatest index of annotation that has an XValue less than the given value
    var that = this;
    var XValue = parseFloat(XVal).toFixed(2);
    var annotations = that.vars.universalChangePointAnnotationsCache;
    var XValues = annotations.map(a => parseFloat(that._getAnnotationXMinFixed(a)).toFixed(2));

    var index;

    if (XValues.includes(XValue)) {
      index = XValues.indexOf(XValue);
    } else {
      XValues.push(XValue);
      XValues.sort((a, b) => a - b);
      index = XValues.indexOf(XValue) - 1;
    }
    return index;
  },

  _getNonTrivialUniversalAnnotations: function() {
    var that = this;
    // non trivial means that an annotation has an actual sleep stage value saved in it.
    that.vars.chart.annotations.allItems.sort((a, b) => {
      return that._getAnnotationXMinFixed(a) - that._getAnnotationXMaxFixed(b);
    });

    var annotations = that.vars.chart.annotations.allItems.filter(a => a.metadata.displayType == 'ChangePointAll' && 
      a.metadata.annotationLabel !== undefined &&
      a.metadata.annotationLabel != "undefined" &&
      a.metadata.annotationLabel != "(data missing)");
    
    that.vars.universalChangePointAnnotationsCache = annotations;
    return annotations;
  },


  _saveFullWindowLabel: function (annotationCategory, label, rationale) {
    var that = this;
    var label = label;
    var time_start = that.vars.currentAnnotationTime;
    var time_end = time_start + that.vars.xAxisScaleInSeconds;
    var channel = undefined;
    var confidence = 1;
    var comment = "";
    var cacheKey = that._getAnnotationsCacheKey(
      that.vars.currentWindowRecording,
      time_start,
      time_end,
      false,
      annotationCategory
    );
    var annotation = that.vars.annotationsCache[cacheKey] || {};

    ////console.log(time_start);
    that._saveAnnotation(
      annotation.id,
      that.vars.currentWindowRecording,
      label,
      time_start,
      time_end,
      channel,
      confidence,
      comment,
      {},
      rationale,
      function (savedAnnotation, error) {
        if (savedAnnotation) {
          annotationFormatted = savedAnnotation.value;
          annotationFormatted.id = savedAnnotation.id;
          annotationFormatted.arbitration = savedAnnotation.arbitration;
          annotationFormatted.arbitrationRoundNumber =
            savedAnnotation.arbitrationRoundNumber;
          annotationFormatted.rationale = savedAnnotation.rationale;
          that.vars.currentAnnotationTime = null;
          that.vars.annotationsCache[cacheKey] = savedAnnotation;
        }
        that._refreshAnnotations();
      }
    );
  },

  _refreshAnnotations: function () {
    var that = this;
    that._getAnnotations(
      that.vars.currentWindowRecording,
      that.vars.currentWindowStart,
      that.vars.currentWindowStart + that.vars.xAxisScaleInSeconds
    );
  },

  _saveArtifactAnnotation: function (type) {
    var that = this;
    that._saveFullWindowLabel("ARTIFACT", type);
  },

  _isDisagreementCase: function () {
    var that = this;
    return $(".votes-info.has-disagreement").length > 0;
  },

  _saveSleepStageAnnotation: function (type) {
    var that = this;
    if (that._isArbitrating()) {
      if (
        !that._isDisagreementCase() &&
        !confirm(
          "You are trying to re-score a case for which all panel members already agree with you. While you're free to do this, it is not required to re-score agreement cases. We only ask to re-score those cases with any level of disagreement. The red arrow buttons in the bottom right-hand corner of the page let you jump to the next or previous disagreement case. There are also keyboard shortcuts for this: [D] to jump to the next disagreement case; and [A] to jump to the previous disagreement case. In addition, you may also press [SPACE BAR] to toggle a panel showing you how many disagreement cases you have already re-scored and how many are left. Press OK to re-score this agreement case anyways; or press CANCEL to stop here."
        )
      ) {
        that._refreshAnnotations();
      } else {
        c;
        const fullWindowLabelHumanReadable =
          that.vars.fullWindowLabelsToHumanReadable[type];
        var title = "Why " + fullWindowLabelHumanReadable + "?";
        const rationaleFormData = _.extend(that.options.context, {
          task: that.options.context.task,
          decisionField: "value.label",
          decision: type,
          decisionHumanReadable: fullWindowLabelHumanReadable,
        });
        let rationaleFormView;
        // //console.log("here is reached");
        swal({
          title: title,
          confirmButtonText: "Submit",
          showCancelButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          footer: "<b>Press SHIFT + ENTER to submit.</b>",
          animation: false,
          focusConfirm: false,
          backdrop: "rgba(0, 0, 0, 0.4)",
          onBeforeOpen() {
            rationaleFormView = Blaze.renderWithData(
              Template.RationaleForm,
              rationaleFormData,
              swal.getContent(),
              swal.getContent().firstChild
            );
            $(swal.getContent()).keypress((e) => {
              if (e.which == 13 && e.shiftKey) {
                e.stopImmediatePropagation();
                swal.clickConfirm();
              }
            });
            $(swal.getContent())
              .find("input")
              .keypress((e) => {
                if (e.which == 13) {
                  e.stopImmediatePropagation();
                  swal.clickConfirm();
                }
              });
          },
          preConfirm() {
            return Template.RationaleForm.__helpers
              .get("rationale")
              .call(
                rationaleFormView._domrange.members[0].view.templateInstance(),
                swal.showValidationMessage
              );
          },
        }).then((result) => {
          if (result.dismiss) {
            that._refreshAnnotations();
            swal(
              "Scoring decision not saved.",
              "Please try again and provide a rationale.",
              "warning"
            );
            return;
          }
          const rationale = result.value;
          that._saveFullWindowLabel("SLEEP_STAGE", type, rationale);
        });
      }
    } else {
      // //console.log("wtc");
      that._saveFullWindowLabel("SLEEP_STAGE", type);
    }
  },

  _getAnnotationXMinFixed: function (annotation) {
    return parseFloat(annotation.options.xValue).toFixed(2);
  },

  _getAnnotationXMaxFixed: function (annotation) {
    if (annotation.metadata.displayType === 'ChangePoint' || annotation.metadata.displayType === 'ChangePointAll') {
      return parseFloat(annotation.options.xValue).toFixed(2);
    } else {
      // console.log(annotation.options.xValue);
      // console.log(annotation.options.shape.params.width);
      // console.log(annotation.options.shape.params.width + annotation.options.xValue);
      return parseFloat(
        annotation.options.xValue + annotation.options.shape.params.width
      ).toFixed(2);
    }
    
  },

  _getAxis: function (key) {
    var that = this;
    switch (key) {
      case "x":
      case "X":
        var axis = that.vars.chart.xAxis[0];
        break;
      default:
        var axis = that.vars.chart.yAxis[0];
        break;
    }
    return axis;
  },

  _convertPixelsToValue: function (pixels, axisKey) {
    var axis = this._getAxis(axisKey);
    return axis.toValue(pixels);
  },

  _convertValueToPixels: function (value, axisKey) {
    var axis = this._getAxis(axisKey);
    return axis.toPixels(value);
  },

  _convertPixelsToValueLength: function (pixels, axisKey) {
    var axis = this._getAxis(axisKey);
    return Math.abs(axis.toValue(pixels) - axis.toValue(0));
  },

  _convertValueToPixelsLength: function (value, axisKey) {
    var axis = this._getAxis(axisKey);
    return Math.abs(axis.toPixels(value) - axis.toPixels(0));
  },

  _isChannelSelected: function () {
    if (this.vars.selectedChannelIndex === undefined) {
      return false;
    }

    return true;
  },

  _getChannelsAnnotated: function (yMin, yMax) {
    var that = this;
    var index1 = that._getChannelIndexFromY(yMin);
    var index2 = that._getChannelIndexFromY(yMax);
    var indexMin = Math.min(index1, index2);
    var indexMax = Math.max(index1, index2);
    var channels = [];
    for (var i = indexMin; i <= indexMax; ++i) {
      channels.push(i);
    }
    return channels;
  },

  _getChannelIndexFromY: function (value) {
    var that = this;
    var numberOfChannels = that.vars.currentWindowData.channels.length;
    var indexFromEnd = Math.floor(
      (value + that.options.graph.channelSpacing / 2) /
        that.options.graph.channelSpacing
    );
    var index = numberOfChannels - 1 - indexFromEnd;
    index = Math.min(numberOfChannels - 1, index);
    index = Math.max(index, 0);
    return index;
  },

  _setupLabelHighlighting: function () {
    var that = this;
    $(that.element)
      .find(".channel-label")
      .click(function (event) {
        var index = $(this).data("index");

        that._selectChannel(index);
        // console.log(that.vars.selectedChannelIndex);
        // that._changeAmplitude(index, that.vars.allChannels);
      });
  },

  _selectChannel: function (index) {
    var that = this;
    that.vars.selectedChannelIndex = index;
    $(".channel-label").removeClass("selected");
    $(".gain-button").prop("disabled", false);
    if (index !== undefined) {
      $(that.element)
        .find('.channel-label[data-index="' + index + '"]')
        .addClass("selected");
    }

    if (that._isChannelSelected() === true) {
      // checks if a channel is selected
      // renders the amplitude adjustment menu given the channel index
      that._renderAmplitudeAdjustmentMenu(that.vars.selectedChannelIndex);
      const channelName = this.vars.currentWindowData.channels[index].name;
    }
  },

  _renderAmplitudeAdjustmentMenu: function (index) {
    var that = this;

    // checks if a channel is selected
    if (that._isChannelSelected !== undefined) {
      // gets the relevant elements from the DOM

      const amplitudeAdjustmentButtons = $(".amplitude_adjustment_button");
      const increaseButton = $("#increase");
      const decreaseButton = $("#decrease");
      const defaultButton = $("#default");
      const scaleform = $("#scaleform");
      const scaleinput = $("#scaleinput");
      const scaleToScreen = $("#scaletoscreen");
      const scaleAllToScreen = $("#scalealltoscreen");

      const reversePolarity = $("#reversepolarity");
      const moveUp = $("#moveup");
      const moveDown = $("#movedown");

      // gets the selected channel's name
      const channelName = that.vars.currentWindowData.channels[index].name;

      // render the channel name on screen inside amplitude adjustment container
      $(".channel_name").text("Channel Selected: " + channelName);

      //activate the buttons
      $(amplitudeAdjustmentButtons).prop("disabled", false);
      $(amplitudeAdjustmentButtons).addClass(".active");
      $(scaleinput).prop("disabled", false);

      // sets the increase button's onclick function
      $(increaseButton)
        .off()
        .on("click", function () {
          that._increaseAmplitude(index);
          console.log("increasing amplitude");
          that.vars.chart.redraw();
        });

      // sets the decrease button's onclick function
      $(decreaseButton)
        .off()
        .on("click", function () {
          that._decreaseAmplitude(index);
          console.log("decreasing amplitude");
          that.vars.chart.redraw(); //redraws the chart with the scaled data
        });

      // sets the default button's onclick function
      $(defaultButton)
        .off()
        .on("click", function () {
          that._defaultAmplitude(index);
          console.log("defaulting amplitude");
          that.vars.chart.redraw(); //redraws the chart with the scaled data
        });

      // sets the scaleform's onsubmit function
      $(scaleform)
        .off()
        .on("submit", function (event) {
          event.preventDefault();
          const scaleValue = $(scaleinput).val();
          that._customAmplitude(index, scaleValue);
          //gets a custom scale value
          that.vars.chart.redraw();
        });

      // sets the scale to screen button's onclick function
      $(scaleToScreen)
        .off()
        .on("click", function () {
          that._scaleToScreen(index);
          that.vars.chart.redraw(); //redraws the chart with the scaled data
        });

      $(scaleAllToScreen)
        .off()
        .on("click", function () {
          that._scaleAllToScreen();
          that.vars.chart.redraw(); //redraws the chart with the scaled data
        });

      $(reversePolarity)
        .off()
        .on("click", function () {
          that._reversePolarity(index);
          that.vars.chart.redraw(); //redraws the chart with the reversed polarity
        });

      $(moveUp)
        .off()
        .on("click", function () {
          that._moveUp(index);
          that.vars.chart.redraw(); //redraws the chart with the moved channel
        });

      $(moveDown)
        .off()
        .on("click", function () {
          that._moveDown(index);
          that.vars.chart.redraw(); //redraws the chart with the moved channel
        });
    }
  },

  _reversePolarity: function (index) {
    var that = this;

    var that = this;
    if (that._isChannelSelected() === true) {
      // checks if a channel is selected
      channel = that.vars.allChannels[index];
    }

    //gets the zeroPosition of each channel (where they would = 0 if the channel was centred at y = 0)
    const zeroPosition = that._getOffsetForChannelIndexPostScale(index);

    const movement = that.vars.translation[index]
      ? that.vars.translation[index]
      : 0;

    console.log(`movement = ${movement}`);
    // console.log(that.vars.chart.series[index].yData);
    that.vars.chart.series[index].yData.forEach((point, idx) => {
      if (point !== zeroPosition) {
        that.vars.chart.series[index].yData[idx] =
          // some math that checks if the point is above or below the zero position and then scaling that value, then readding it to zeroposition
          // to get an accurate percentage scaling

          zeroPosition + movement + (point - zeroPosition - movement) * -1;
      }
    });

    if (that.vars.recordPolarity) {
      if (that.vars.polarity.hasOwnProperty(index)) {
        delete that.vars.polarity[index];
      } else {
        that.vars.polarity[index] = -1;
      }
    }
  },

  _customTranslation: function (index, value) {
    var that = this;
    if (that._isChannelSelected() === true) {
      // checks if a channel is selected
      channel = that.vars.allChannels[index];
    }

    // takes each point in the ydata of the graph and scales it by the scaleFactor

    // console.log(that.vars.chart.series[index].yData);
    that.vars.chart.series[index].yData.forEach((point, idx) => {
      that.vars.chart.series[index].yData[idx] =
        // some math that checks if the point is above or below the zero position and then scaling that value, then readding it to zeroposition
        // to get an accurate percentage scaling;
        point + value;
    });

    // code allowing the scaling to persist when you switch windows
    if (that.vars.recordTranslation) {
      // checks if the recordScalingFactors object has the current index in it
      if (that.vars.translation.hasOwnProperty(index)) {
        // if it does, we multiply the percentage in order to be able to scale upcoming screens with the same percentage
        that.vars.translation[index] += value;
      } else {
        // if not we just add a new key value pair to the object
        that.vars.translation[index] = value;
      }
    }

    console.log(that.vars.translation);
    console.log(that.vars.recordTranslation);
  },

  _moveDown: function (index) {
    var that = this;
    that._customTranslation(index, -25);
  },

  _moveUp: function (index) {
    var that = this;
    that._customTranslation(index, 25);
  },

  _increaseAmplitude: function (index) {
    // preset decrease amplitude function that increases amplitude by 100%

    var that = this;
    that._customAmplitude(index, 100);
  },

  _decreaseAmplitude: function (index) {
    // preset decrease amplitude function that decreases amplitude by 50%

    var that = this;
    that._customAmplitude(index, -50);
  },

  _customAmplitude: function (index, scaleFactor) {
    //converts scaleFactor to a decimal from percentage
    scaleFactor = scaleFactor / 100;

    var that = this;
    if (that._isChannelSelected() === true) {
      // checks if a channel is selected
      channel = that.vars.allChannels[index];
    }

    //gets the zeroPosition of each channel (where they would = 0 if the channel was centred at y = 0)
    const zeroPosition = that._getOffsetForChannelIndexPostScale(index);

    // takes each point in the ydata of the graph and scales it by the scaleFactor

    // console.log(that.vars.chart.series[index].yData);
    that.vars.chart.series[index].yData.forEach((point, idx) => {
      if (point !== zeroPosition) {
        that.vars.chart.series[index].yData[idx] =
          // some math that checks if the point is above or below the zero position and then scaling that value, then readding it to zeroposition
          // to get an accurate percentage scaling
          zeroPosition + (point - zeroPosition) * (1 + scaleFactor);
      }
    });

    // code allowing the scaling to persist when you switch windows
    if (that.vars.recordScalingFactors) {
      // checks if the recordScalingFactors object has the current index in it
      if (that.vars.scalingFactors.hasOwnProperty(index)) {
        // if it does, we multiply the percentage in order to be able to scale upcoming screens with the same percentage
        that.vars.scalingFactors[index] *= 1 + scaleFactor;
      } else {
        // if not we just add a new key value pair to the object
        that.vars.scalingFactors[index] = 1 + scaleFactor;
      }
    }
  },

  _scaleAllToScreen: function () {
    // scales all channels to the screen
    var that = this;

    that._defaultAmplitude;
    that.vars.allChannels.forEach((channel, idx) => {
      that._scaleToScreen(idx);
    });
  },

  _scaleToScreen: function (index) {
    var that = this;

    // for each channel, we get the max/min values of the yData and check if it is above/below zeroPosition +/- 200,
    const zeroPosition = that._getOffsetForChannelIndexPostScale(index);

    const maxChannelData = that._getMaxChannelData(index) - zeroPosition;
    const minChannelData = that._getMinChannelData(index) - zeroPosition;

    const lowerBound = -200;
    const upperBound = 200;

    const percentageDifferenceUpper = that._getPercentDifference(
      maxChannelData,
      upperBound
    );
    const percentageDifferenceLower = that._getPercentDifference(
      minChannelData,
      lowerBound
    );

    // the absolute difference between the lowerBound and the min value
    const absoluteLowerDifference = Math.abs(
      Math.abs(lowerBound) - Math.abs(minChannelData)
    );

    // the absolute difference between the upperBound and the max value
    const absoluteUpperDifference = Math.abs(
      Math.abs(upperBound) - Math.abs(maxChannelData)
    );

    // console.log("====BEFORE=====")
    // console.log("Channel: " + index);
    // console.log("min: " + minChannelData);
    // console.log("max : " + maxChannelData);
    // console.log("maxChannelData -zeroPosition: " + (maxChannelData -zeroPosition));
    // console.log("minChannelData -zeroPosition: " + (minChannelData - zeroPosition));
    // console.log("zeroPosition: " + zeroPosition);
    // console.log("lowerBound: " + lowerBound);
    // console.log("upperBound: " + upperBound);
    // console.log("absoluteLowerDifference: " + absoluteLowerDifference);
    // console.log("absoluteUpperDifference: " + absoluteUpperDifference);
    // console.log("percentageDifferenceUpper: " + percentageDifferenceUpper);
    // console.log("percentageDifferenceLower: " + percentageDifferenceLower);

    if (lowerBound > minChannelData || upperBound < maxChannelData) {
      //checks if the data is not within the bounds, we scale the data down to "fit the screen"

      if (lowerBound > minChannelData && upperBound < maxChannelData) {
        // if both are out of bounds
        // check which absolute difference is the greater
        // value to get the percentage difference

        if (absoluteLowerDifference > absoluteUpperDifference) {
          // if the lowerdifference is greater, we scale the data by the percentage difference

          that._customAmplitude(index, percentageDifferenceLower);
        } else {
          // if the upperdifference is greater, we scale the data by the percentage difference

          that._customAmplitude(index, percentageDifferenceUpper);
        }
      } else if (lowerBound > minChannelData && upperBound > maxChannelData) {
        // if the min data is not within the lower bound
        // we scale the data by the percentage difference

        that._customAmplitude(index, percentageDifferenceLower);
      } else if (lowerBound < minChannelData && upperBound < maxChannelData) {
        // if the max data is not within the upper bound
        // we scale the data by the percentage difference

        that._customAmplitude(index, percentageDifferenceUpper);
      }
    } else if (lowerBound < minChannelData || upperBound > maxChannelData) {
      // checks if data is within bounds, but is not scaled enough to "fit the screen"

      if (lowerBound < minChannelData && upperBound > maxChannelData) {
        // if both are too small
        // check which absolute difference is the lesser
        // value to get the percentage difference

        if (absoluteLowerDifference > absoluteUpperDifference) {
          that._customAmplitude(index, percentageDifferenceUpper);
        } else {
          that._customAmplitude(index, percentageDifferenceLower);
        }
      } else if (lowerBound < minChannelData && upperBound < maxChannelData) {
        // if the min data is not within the lower bound
        // we scale the data by the percentage difference

        that._customAmplitude(index, percentageDifferenceLower);
      } else if (lowerBound > minChannelData && upperBound > maxChannelData) {
        // if the max data is not within the upper bound
        // we scale the data by the percentage difference

        that._customAmplitude(index, percentageDifferenceUpper);
      }
    }
  },

  _getPercentDifference: function (initialValue, finalValue) {
    // gets the percentage difference between two values
    return ((finalValue - initialValue) / initialValue) * 100;
  },

  _getMaxChannelData: function (index) {
    //gets the largest data point in the channel
    var that = this;
    return Math.max(...that.vars.chart.series[index].yData);
  },

  _getMinChannelData: function (index) {
    //gets the smallest data point in the channel
    var that = this;
    return Math.min(...that.vars.chart.series[index].yData);
  },

  _defaultAmplitude: function () {
    // resets the amplitude to the default one by clearing all scalingFactors that were set when we scaled previously
    // (if we used any scaling features before we store it in the scalingFactors variable)
    var that = this;
    if (that._isChannelSelected() === true) {
      that.vars.scalingFactors = {}; // clears the scalingFactors object
      that.vars.polarity = {};
      that.vars.translation = {};
      that._reloadCurrentWindow(); // reloads the current window

      // OLD CODE:
      // // checks if a channel is selected
      // channel = that.vars.allChannels[index];

      // // dont really know what this does, 95% sure will have to change it later
      // that.vars.valueOptions = 0;
      // that.vars.channelAmplitudeOnChange = {
      // 	name: channel.name,
      // 	dataId: channel.dataId,
      // };
    }
  },

  _unselectChannels: function () {
    var that = this;
    that._selectChannel();
  },

  _renderChannelSelection: function () {
    var that = this;
    that._selectChannel(that.vars.selectedChannelIndex);
  },

  _setupYAxisLinesAndLabels: function () {
    var that = this;
    var axis = that.vars.chart.yAxis[0];
    var channels = that.vars.currentWindowData.channels;

    channels.forEach((channel, c) => {
      var offsetPreScale = that._getOffsetForChannelPreScale(channel);
      var offsetPostScale = that._getOffsetForChannelIndexPostScale(c);
      var channelUnit = that._getUnitForChannel(channel);
      var zeroLineID = "channel_" + c + "_zero";
      axis.removePlotLine(zeroLineID);
      var zeroLineOptions = {
        id: zeroLineID,
        color: "#dddddd",
        value: offsetPostScale,
        width: 1,
      };
      axis.addPlotLine(zeroLineOptions);

      if (!that.options.showReferenceLines) return;

      // var referenceValues = that._getReferenceValuesForChannel(channel);
      // referenceValues.forEach((referenceValue, r) => {
      //   var referenceValueWithGain =
      //     (referenceValue + offsetPreScale) * that._getGainForChannelIndex(c);
      //   var referenceLineID = "channel_" + c + "_reference_" + r;
      //   axis.removePlotLine(referenceLineID);
      //   var flipFactor = that._getFlipFactorForChannel(channel);
      //   var referenceLineOptions = {
      //     id: referenceLineID,
      //     color: "#ff0000",
      //     dashStyle: "dash",
      //     value: offsetPostScale + referenceValueWithGain,
      //     width: 1,
      //     zIndex: 1,
      //     label: {
      //       text: flipFactor * referenceValue + " " + channelUnit,
      //       textAlign: "right",
      //       verticalAlign: "middle",
      //       x: -15,
      //       y: 3,
      //       style: {
      //         color: "red",
      //         marginRight: "50px",
      //       },
      //     },
      //   };
      //   axis.addPlotLine(referenceLineOptions);
      // });
    });
  },

  _inferDataModalityFromChannel: function (channel) {
    var name = channel.name.toLowerCase();
    // electrooculography
    if (
      name.indexOf("eog") > -1 ||
      name.indexOf("loc") > -1 ||
      name.indexOf("roc") > -1
    ) {
      return "EOG";
    }
    // electrocardiography
    if (name.indexOf("ecg") > -1 || name.indexOf("ekg") > -1) {
      return "ECG";
    }
    // electromygraphy
    if (
      name.indexOf("emg") > -1 ||
      name.indexOf("chin") > -1 ||
      name.indexOf("leg") > -1 ||
      name.indexOf("tib") > -1
    ) {
      return "EMG";
    }
    // respiratory signal
    if (
      name.indexOf("resp") > -1 ||
      name.indexOf("abd") > -1 ||
      name.indexOf("tho") > -1 ||
      name.indexOf("can") > -1 ||
      name.indexOf("therm") > -1 ||
      name.indexOf("airflow") > -1 ||
      name.indexOf("nasal") > -1
    ) {
      return "RESP";
    }
    // snoring signal
    if (name.indexOf("snore") > -1) {
      return "SNORE";
    }
    // pulse-oximetric oxygen saturation
    if (name.indexOf("spo2") > -1) {
      return "SPO2";
    }
    // unnamed auxiliary non-EEG channels
    if (name.indexOf("aux") > -1) {
      return "AUX";
    }
    // electroencephalography
    // (default if no other channel
    // type was recognized)
    return "EEG";
  },

  _getUnitForChannel: function (channel) {
    var that = this;
    var inferredDataModality = that._inferDataModalityFromChannel(channel);
    switch (inferredDataModality) {
      case "EEG":
      case "EOG":
      case "EMG":
        return "μV";
      case "ECG":
        return "mV";
      case "RESP":
        return "";
      case "SPO2":
        return "%";
      default:
        return "unit unknown";
    }
  },

  _getFlipFactorForChannel: function (channel) {
    var that = this;
    if (that._shouldChannelBeFlippedVertically(channel)) {
      return -1;
    }
    return 1;
  },

  _shouldChannelBeFlippedVertically: function (channel) {
    var that = this;
    var inferredDataModality = that._inferDataModalityFromChannel(channel);
    switch (inferredDataModality) {
      case "EEG":
      case "EOG":
      case "EMG":
      case "ECG":
        return true;
      case "RESP":
      case "SPO2":
        return false;
      default:
        return true;
    }
  },

  _getReferenceValuesForChannel: function (channel) {
    var that = this;
    var inferredDataModality = that._inferDataModalityFromChannel(channel);
    switch (inferredDataModality) {
      case "EEG":
        return [-37.5, 37.5];
      case "EOG":
      case "EMG":
      case "ECG":
      case "RESP":
        return [];
      case "SPO2":
        return [90, 100];
      default:
        return [];
    }
  },

  _getOffsetForChannelPreScale: function (channel) {
    var that = this;
    var inferredDataModality = that._inferDataModalityFromChannel(channel);
    switch (inferredDataModality) {
      case "EEG":
      case "EOG":
      case "EMG":
      case "ECG":
      case "RESP":
        return 0;
      case "SPO2":
        return -96;
      default:
        return 0;
    }
  },

  _getStaticFrequencyFiltersForChannel: function (channel) {
    var that = this;
    const inferredDataModality = that._inferDataModalityFromChannel(channel);
    const staticFrequencyFiltersByDataModality =
      that.options.staticFrequencyFiltersByDataModality || {};
    const staticFilters =
      staticFrequencyFiltersByDataModality[inferredDataModality] || {};
    return Object.entries(staticFilters).map((e) => {
      return { type: e[0], selectedValue: e[1] };
    });
  },

  _updateChannelGain: function (action) {
    var that = this;
    if (that.options.channelGainAdjustmentEnabled === false) {
      return;
    }
    var channelIndices;
    if (that.vars.selectedChannelIndex === undefined) {
      channelIndices = that._getChannelGains().map((gain, c) => c);
    } else {
      channelIndices = [that.vars.selectedChannelIndex];
    }
    if (action === "reset") {
      channelIndices.forEach((c) => {
        that._getChannelGains()[c] = 1;
      });
    } else {
      var gainChangeFactor = 1 + that.options.relativeGainChangePerStep;
      if (action === "step_decrease") {
        gainChangeFactor = 1 / gainChangeFactor;
      }
      channelIndices.forEach((c) => {
        that._getChannelGains()[c] *= gainChangeFactor;
      });
    }
    that._reloadCurrentWindow();
    that._savePreferences({
      channelGains: that.vars.channelGains,
    });
  },

  _getFeatureColor: function (featureKey, isAnswer, confidence) {
    var that = this;
    var isAnswer = !!isAnswer;
    var confidence = confidence !== undefined ? confidence : 1;
    var feature = that.options.features.options[featureKey];
    if (!feature) {
      console.error("Could not find feature", featureKey);
      return "rgba(255, 0, 0, 1)";
    }
    if (isAnswer) {
      var color = feature.answer;
    } else {
      var color = feature.annotation;
    }
    var min = color.alpha.min;
    var max = color.alpha.max;
    var alpha = min + confidence * (max - min);
    var colorValues = [color.red, color.green, color.blue, alpha];
    var colorString = "rgba(" + colorValues.join(",") + ")";
    return colorString;
  },

  _getUUID: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  },

  _getBorderTopForChannelIndex: function (index) {
    var that = this;
    var top =
      that._getOffsetForChannelIndexPostScale(index) +
      that.options.graph.channelSpacing / 2;
    return top;
  },

  _getBorderBottomForChannelIndex: function (index) {
    var that = this;
    var bottom =
      that._getOffsetForChannelIndexPostScale(index) -
      that.options.graph.channelSpacing / 2;
    return bottom;
  },

  _getArbitration: function () {
    var that = this;
    return that.options.context.assignment.arbitration;
  },

  _getArbitrationDoc: function () {
    var that = this;
    return that.options.context.assignment.arbitrationDoc();
  },

  _getArbitrationRoundNumber: function () {
    var that = this;
    return that.options.context.assignment.arbitrationRoundNumber;
    return roundNumber;
  },

  _getArbitrationRoundNumberInt: function () {
    var that = this;
    var roundNumber = that._getArbitrationRoundNumber();
    roundNumber = !!roundNumber ? roundNumber : 0;
    return roundNumber;
  },

  _isArbitrating: function () {
    var that = this;
    return that._getArbitration() && that._getArbitrationRoundNumberInt() > 0;
  },

  _addArbitrationInformationToObject: function (object) {
    var that = this;
    var arbitration = that._getArbitration();
    if (arbitration !== undefined) {
      object.arbitration = arbitration;
    }
    var arbitrationRoundNumber = that._getArbitrationRoundNumber();
    if (arbitrationRoundNumber !== undefined) {
      object.arbitrationRoundNumber = arbitrationRoundNumber;
    }
  },

  _savePreferences: function (updates) {
    var that = this;
    if (that.options.isReadOnly) return;
    if (!that.options.context.preferences) return;
    var modifier = {};
    for (key in updates) {
      modifier["annotatorConfig." + key] = updates[key];
    }
    const context = that.options.context;
    that._addArbitrationInformationToObject(modifier);
    modifier = { $set: modifier };
    Preferences.update(
      that.options.context.preferences._id,
      modifier,
      (error, numPreferencesUpdated) => {
        if (error) {
          console.error(error);
          if (!Roles.userIsInRole(Meteor.userId(), "tester")) {
            alert(error.message);
          }
        }
        that.options.context.preferences = Preferences.findOne(
          that.options.context.preferences._id
        );
      }
    );
  },

  _saveUserEvent: function (eventType, metadata) {
    var that = this;
    var eventType = eventType !== undefined ? eventType : "undefined";
    var metadata = metadata !== undefined ? metadata : {};
    if (that.options.projectUUID) {
      metadata.projectUUID = that.options.projectUUID;
    }
    var options = {
      eventType: eventType,
      metadata: metadata,
    };
    console.error(
      "Trying to save a user event, but this feature is not implemented yet."
    );
  },

  _loadChannelTimeshiftFromPreference: function () {
    console.log("getting preference");
    var that = this;
    let timeshiftFromPreference =
      that.options.context.preferences.annotatorConfig.channelTimeshift;
    that.vars.channelTimeshift = timeshiftFromPreference
      ? timeshiftFromPreference
      : {};
    console.log(timeshiftFromPreference);
    if (timeshiftFromPreference && timeshiftFromPreference[Object.keys(timeshiftFromPreference)[0]]) {
      $(".time_sync").text("Time Difference: " + timeshiftFromPreference[Object.keys(timeshiftFromPreference)[0]] + " s");
    }
    
  },

  _getCurrAssignment() {
    that = this;
    assigns = Assignments.find(
      {
        task: that.options.context.task._id,
        dataFiles: that.options.context.dataset.map((data) => data._id),
      },
      {
        sort: { updatedAt: -1 },
      }
    ).fetch();

    assign = assigns[0];

    return assign;
  },

  _saveUserEventWindow: function (beginOrComplete) {
    var that = this;
    if (!that._isHITModeEnabled()) return;
    that._saveUserEvent("window_" + beginOrComplete, {
      recordingName: that.options.recordingName,
      windowStart: that.vars.currentWindowStart,
      windowSizeInSeconds: that.vars.xAxisScaleInSeconds,
      channelsDisplayed: that._getChannelsDisplayed(),
      features: that.options.features.order,
      isTraining: that._isCurrentWindowTrainingWindow(),
    });
  },

  _saveUserEventWindowBegin: function () {
    var that = this;
    that._saveUserEventWindow("begin");
  },

  _saveUserEventWindowComplete: function () {
    var that = this;
    that._saveUserEventWindow("complete");
  },

  _getAnnotations: function (
    recording_name,
    window_start,
    window_end,
    correctAnswers
  ) {
    var that = this;
    // if (!that.options.features.showUserAnnotations) return;
    // if (that.options.features.showAllBoxAnnotations == "none") return;

    var cacheKey = that._getAnnotationsCacheKey(
      recording_name,
      window_start,
      window_end,
      correctAnswers
    );
    
    console.log(that.vars.annotationsCache[cacheKey]);


    if (that.vars.annotationsLoaded && that.vars.annotationsCache[cacheKey]) {
      var data = that.vars.annotationsCache[cacheKey] || {
        annotations: [],
      };
      if (!correctAnswers) {
        that._incrementNumberOfAnnotationsInCurrentWindow(
          that._getVisibleAnnotations(data.annotations).length
        );
      }
      that._displayArtifactsSelection(data.annotations);
      that._displaySleepStageSelection(
        data.annotations,
        window_start,
        window_end
      );
      return;
    }
    that.vars.annotationsCache[cacheKey] = {
      annotations: [],
    };
    var annotations;

    if (Roles.userIsInRole(Meteor.userId(), "admin")) {
      // Devil's bargin quick fix: assume the user only wants his own annotations

      // if (that.options.features.showAllBoxAnnotations == "all") {
      //   //     //console.log("inside annotate");
      //   //grab annotations from all users
      //   ////console.log(that.options.context.data._id);
      //   // //console.log(that.options.context.assignment._id);
      //   annotations = Annotations.find(
      //     {
      //         assignment: that.options.context.assignment._id,
      //       dataFiles: that.options.context.dataset.map((data) => data._id),
      //       type: "SIGNAL_ANNOTATION",
      //     },
      //     {
      //       sort: { updatedAt: -1 },
      //     }
      //   ).fetch();
      // } else if (that.options.features.showAllBoxAnnotations == "my") {
        //grab annotations from this current admin user
        annotations = Annotations.find(
          {
            assignment: that.options.context.assignment._id,
            dataFiles: that.options.context.dataset.map((data) => data._id),
            user: Meteor.userId(),
            type: "SIGNAL_ANNOTATION",
          },
          {
            sort: { updatedAt: -1 },
          }
        ).fetch();
      // } 
      // else if (that.options.features.showAllBoxAnnotations != "") {
      //   //grab annotations from the selected user
      //   annotations = Annotations.find(
      //     {
      //       assignment: that.options.context.assignment._id,
      //       dataFiles: that.options.context.dataset.map((data) => data._id),
      //       user: that.options.features.showAllBoxAnnotations,
      //       type: "SIGNAL_ANNOTATION",
      //     },
      //     {
      //       sort: { updatedAt: -1 },
      //     }
      //   ).fetch();
      //   console.log(8189);
      //   console.log(annotations);

      // }
    } else {
      //grab annotations from this current non-admin user
      annotations = Annotations.find(
        {
          assignment: that.options.context.assignment._id,
          dataFiles: that.options.context.dataset.map((data) => data._id),
          user: Meteor.userId(),
          type: "SIGNAL_ANNOTATION",
        },
        {
          sort: { updatedAt: -1 },
        }
      ).fetch();
    }
    
    that.vars.annotationsLoaded = true;

    annotations = annotations.map(function (annotation) {
      var annotationFormatted = annotation.value;
      annotationFormatted.id = annotation._id;
      annotationFormatted.user = annotation.user;
      annotationFormatted.arbitration = annotation.arbitration;
      annotationFormatted.arbitrationRoundNumber =
        annotation.arbitrationRoundNumber;
      annotationFormatted.rationale = annotation.rationale;
      return annotationFormatted;
    });
    annotations.forEach(function (annotation) {
      var annotationWindowStart =
        Math.floor(annotation.position.start / that.vars.xAxisScaleInSeconds) *
        that.vars.xAxisScaleInSeconds;
      var annotationWindowEnd =
        annotationWindowStart + that.vars.xAxisScaleInSeconds;
      var annotationCacheKey = that._getAnnotationsCacheKey(
        recording_name,
        annotationWindowStart,
        annotationWindowEnd,
        correctAnswers
      );
      if (!that.vars.annotationsCache[annotationCacheKey]) {
        that.vars.annotationsCache[annotationCacheKey] = {
          annotations: [],
        };
      }
      that.vars.annotationsCache[annotationCacheKey].annotations.push(
        annotation
      );
    });
    var data = that.vars.annotationsCache[cacheKey] || {
      annotations: [],
    };
    that._displayArtifactsSelection(data.annotations);
    that._displaySleepStageSelection(
      data.annotations,
      window_start,
      window_end
    );
    that._displayAnnotations(annotations);

    console.log(annotations);

  },

  _getVisibleAnnotations: function (annotations) {
    var that = this;
    var visibleAnnotations = annotations.filter(function (annotation) {
      var isVisibleFeature = true;
        // that.options.features.order.indexOf(annotation.label) > -1;
      var isVisibleChannel = false;
      var annotationChannels = annotation.position.channels;
      if (annotationChannels) {
        if (!annotationChannels.length) {
          annotationChannels = [annotationChannels];
        }
        for (var c = 0; c < annotationChannels.length; ++c) {
          var channelArray = [];
          // annotation.metadata.channels_displayed.values().forEach(element => channelArray.push(...element));
          for (const property in displayedChannels) {
            channelArray.push(...annotation.metadata.channels_displayed[property]);
          }
          var channel = channelArray[annotationChannels[c]];

          // console.log(channel);
          // console.log(annotation.metadata.channels_displayed);
          var displayedChannels = (that._getChannelsDisplayed());
          var displayedChannelsArray = []
          for (const property in displayedChannels) {
            displayedChannelsArray.push(...displayedChannels[property]);
          }
          if (displayedChannelsArray.indexOf(channel) > -1) {
            isVisibleChannel = true
            break;
          }
        }
      }
      return isVisibleFeature && isVisibleChannel;
    });
    return visibleAnnotations;
  },

  _getAnnotationsCacheKey: function (
    recording_name,
    window_start,
    window_end,
    correctAnswers,
    cacheCategory
  ) {
    cacheCategory = cacheCategory || "FEATURE";
    var key =
      recording_name +
      "_" +
      cacheCategory +
      "_" +
      window_start +
      "_" +
      window_end;
    if (correctAnswers) {
      key += "_correct_answers";
    }
    return key;
  },

  _displayArtifactsSelection: function (annotations) {
    var that = this;
    var activeClass = "teal darken-4";
    var noArtifactAnnotation = true;
    $(that.element)
      .find(".artifact_panel button.artifact")
      .removeClass(activeClass);
    for (var i = 0; i < annotations.length; ++i) {
      var annotation = annotations[i];
      if (that.vars.fullWindowLabels[annotation.label] === "ARTIFACT") {
        var cacheKey = that._getAnnotationsCacheKey(
          that.vars.currentWindowRecording,
          annotation.position.start,
          annotation.position.end,
          false,
          "ARTIFACT"
        );
        that.vars.annotationsCache[cacheKey] = annotation;
        $(that.element)
          .find(
            '.artifact_panel button.artifact[data-annotation-type="' +
              annotation.label +
              '"]'
          )
          .addClass(activeClass);
        noArtifactAnnotation = false;
        break;
      }
    }
    if (noArtifactAnnotation) {
      $(that.element)
        .find(
          '.artifact_panel button.artifact[data-annotation-type="artifacts_none"]'
        )
        .addClass(activeClass);
    }
  },

  _displaySleepStageSelection: function (
    annotations,
    epochStartTimeInSeconds,
    epochEndTimeInSeconds
  ) {
    var that = this;

    const arbitrationDoc = that._getArbitrationDoc();
    const arbitrationRoundNumber = that._getArbitrationRoundNumberInt();

    var inactiveClass = "grey lighten-1";
    var activeClassSelectedInPreviousRound =
      "selected-in-previous-round " + inactiveClass;
    var activeClassSelectedInCurrentRound = "teal";
    var activeClasses =
      activeClassSelectedInPreviousRound +
      " " +
      activeClassSelectedInCurrentRound;
    var activeClass = activeClassSelectedInCurrentRound;
    $(that.element)
      .find(".sleep_stage_panel button.sleep_stage")
      .removeClass(activeClasses)
      .addClass(inactiveClass);
    $(that.element)
      .find(".sleep_stage_panel button.sleep_stage .votes-info")
      .removeClass("visible")
      .removeClass("has-disagreement");

    var preClassificationAnnotation = that._getPreClassificationAnnotations({
      "value.position.start": epochStartTimeInSeconds,
      "value.position.end": epochEndTimeInSeconds,
    });
    $(that.element)
      .find(".sleep_stage_panel button.sleep_stage")
      .removeClass("pre-classification");
    if (preClassificationAnnotation && preClassificationAnnotation.length > 0) {
      preClassificationAnnotation = preClassificationAnnotation[0];
      preClassificationLabel = preClassificationAnnotation.value.label;
      $(that.element)
        .find(
          '.sleep_stage_panel button.sleep_stage[data-annotation-type="' +
            preClassificationLabel +
            '"]'
        )
        .addClass("pre-classification");
    }

    try {
      annotations.forEach((annotation) => {
        if (that.vars.fullWindowLabels[annotation.label] === "SLEEP_STAGE") {
          var cacheKey = that._getAnnotationsCacheKey(
            that.vars.currentWindowRecording,
            annotation.position.start,
            annotation.position.end,
            false,
            "SLEEP_STAGE"
          );
          that.vars.annotationsCache[cacheKey] = annotation;
          if (arbitrationDoc && !!arbitrationRoundNumber) {
            annotationArbitrationRoundNumber =
              !!annotation.arbitrationRoundNumber
                ? annotation.arbitrationRoundNumber
                : 0;
            if (
              !annotation.arbitration ||
              annotationArbitrationRoundNumber < arbitrationRoundNumber
            ) {
              activeClass = activeClassSelectedInPreviousRound;
            }
            const labelCounts = {};
            const arbitrationAnnotations =
              Object.values(
                arbitrationDoc.aggregatedAnnotations(
                  {
                    "value.position.start": annotation.position.start,
                    "value.position.end": annotation.position.end,
                  },
                  {
                    reactive: false,
                    fields: { user: 1, "value.label": 1 },
                  },
                  arbitrationRoundNumber
                ).all
              )[0] || [];
            const uniqueLabels = new Set(
              arbitrationAnnotations.map((a) => a.annotation.value.label)
            );
            const hasDisagreement = uniqueLabels.size > 1;
            arbitrationAnnotations.forEach((arbitrationAnnotation) => {
              if (arbitrationAnnotation.annotation.user == Meteor.userId())
                return;
              const label = arbitrationAnnotation.annotation.value.label;
              if (!labelCounts[label]) {
                labelCounts[label] = 1;
              } else {
                labelCounts[label] += 1;
              }
            });
            Object.keys(labelCounts).forEach((label) => {
              labelCount = labelCounts[label];
              const votesInfo = $(that.element)
                .find(
                  '.sleep_stage_panel button.sleep_stage[data-annotation-type="' +
                    label +
                    '"] .votes-info'
                )
                .addClass("visible")
                .text(labelCount);
              if (hasDisagreement) {
                votesInfo.addClass("has-disagreement");
              }
            });
            if (hasDisagreement && arbitrationDoc.currentRoundNumber > 1) {
              that._showInfoPanel();
            } else {
              that._hideInfoPanel();
            }
          }
          $(that.element)
            .find(
              '.sleep_stage_panel button.sleep_stage[data-annotation-type="' +
                annotation.label +
                '"]'
            )
            .removeClass(inactiveClass)
            .addClass(activeClass);
          throw false;
        }
      });
    } catch (error) {
      if (error !== false) {
        console.error(error);
      }
    }
  },

  _turnExampleIntoAnnotation: function (example) {
    var that = this;
    var annotation = {
      id: that._getUUID(),
      label: example.type,
      confidence: example.confidence,
      position: {
        start: example.start,
        end: example.end,
        channels: example.channels,
      },
      metadata: {
        channels_displayed: example.channels_displayed,
        comment: example.comment,
      },
    };
    return annotation;
  },

  _turnExamplesIntoAnnotations: function (examples) {
    var that = this;
    var annotations = [];
    examples.forEach(function (example) {
      annotations.push(that._turnExampleIntoAnnotation(example));
    });
    return annotations;
  },

  _displayAnnotations: function (annotations) {
    console.log(annotations);
    var that = this;

    var chart = that.vars.chart;
    if (chart === undefined) {
      return;
    }

    annotations
    .sort((a, b) => {
      return a.position.start - b.position.start})
    .forEach((annotation) => {
      var type = annotation.label;

      // if (that.options.features.order.indexOf(type) < 0) {
      //   return;
      // }
      var annotationId = annotation.id;

      if (that.vars.annotationIDSet.has(annotationId)) {
        return;
      }

      var start_time = parseFloat(annotation.position.start);
      var end_time = parseFloat(annotation.position.end);
      var confidence = annotation.confidence;
      var comment = annotation.metadata.comment;
      var featureType = undefined;
      var annotationLabel = annotation.metadata.annotationLabel;
      var user = annotation.user;
      // var user = annotation.

      var channelIndices = annotation.position.channels;
      if (channelIndices === undefined) {
        return;
      }
      if (!Array.isArray(channelIndices)) {
        channelIndices = [channelIndices];
      }
      if (start_time === end_time) {
        newAnnotation = that._addAnnotationBoxChangePoint(
          annotationId,
          start_time,
          channelIndices,
          featureType,
          end_time,
        );
        newAnnotation.metadata.displayType = channelIndices.length == that.vars.allChannels.length ? 'ChangePointAll' : 'ChangePoint';
        newAnnotation.metadata.annotationLabel = annotationLabel;
        newAnnotation.metadata.creator = user;
        newAnnotation.metadata.comment = comment;
        // solve label bugs with another
        that._addCommentFormToAnnotationBox(newAnnotation);
        that._addChangePointLabelLeft(newAnnotation);

        that._updateChangePointLabelLeft(newAnnotation);
        that._updateChangePointLabelRight(newAnnotation);


      } else {
        //annotation = that._addAnnotationBox(annotationId, start_time, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], that.vars.activeFeatureType);
        let newAnnotation = that._addAnnotationBox(
          annotationId,
          start_time,
          channelIndices,
          type,
          undefined,
          confidence,
          comment,
          annotation
        );
      
        newAnnotation.metadata.displayType = 'Box';
        newAnnotation.metadata.annotationLabel = annotationLabel;
        newAnnotation.metadata.creator = user;
        newAnnotation.metadata.comment = comment;

      var { height, yValue } =
        that._getAnnotationBoxHeightAndYValueForChannelIndices(channelIndices);


        newAnnotation.update({
          xValue: start_time,
          yValue: yValue,
          shape: {
            params: {
              width: end_time - start_time,
              height: height,
            },
          },
        })
        
        that._addCommentFormToAnnotationBox(newAnnotation);
        that._addChangePointLabelRight(newAnnotation);
        that._updateChangePointLabelRight(newAnnotation);
        if (!newAnnotation.metadata.controlPointAdded) {
          that._addBoxControlPoint(newAnnotation);
        }        


      }


      // var channelIndicesMapped = [];
      // channelIndices.forEach((channelIndex) => {
      //   var channelIndexRecording = that._collapseObjectToArray(
      //     annotation.metadata.channels_displayed)[channelIndex];

      //   // console.log(that._collapseObjectToArray(that
      //   //   ._getChannelsDisplayed()));

      //   var channelIndexMapped = that._collapseObjectToArray(that
      //     ._getChannelsDisplayed())
      //     .indexOf(channelIndexRecording);
      //   while (channelIndexMapped > -1) {
      //     channelIndicesMapped.push(channelIndexMapped);
      //     channelIndexMapped = that._collapseObjectToArray(that
      //       ._getChannelsDisplayed())
      //       .indexOf(channelIndexRecording, channelIndexMapped + 1);
      //   }
      // });

      // channelIndicesMapped
      //   .sort()
      //   .reverse()
      //   .forEach((channelIndexMapped) => {
      //     // //console.log("inside thids")
      //     ////console.log(channelIndexMapped);
      //     console.log(end_time);
      //     if (!end_time) {
      //       annotation = that._addAnnotationChangePointAll(
      //         annotationId,
      //         start_time,
      //         [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      //         that.vars.activeFeatureType
      //       );
      //       annotation.update({
      //         shape: {
      //           params: {
      //             width: 0.01,
      //             height: 8000,
      //           },
      //         },
      //       });
      //     } else {
      //       //annotation = that._addAnnotationBox(annotationId, start_time, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], that.vars.activeFeatureType);
      //       that._addAnnotationBox(
      //         annotationId,
      //         start_time,
      //         channelIndexMapped,
      //         type,
      //         end_time,
      //         confidence,
      //         comment,
      //         annotation
      //       );
      //     }
      //   });
    });
  },

  _flushAnnotations: function () {
    var that = this;
    annotations = that.vars.chart.annotations.allItems;
    while (annotations && annotations.length > 0) {
      annotations[0].destroy();
      that.vars.chart.selectedAnnotation = null;
    }
    that.vars.annotationsCache = {};
  },

  _saveAnnotation: function (
    annotationId,
    recording_name,
    type,
    start,
    end,
    channels,
    confidence,
    comment,
    metadata,
    annotationLabel,
    rationale,
    callback
  ) {
    var that = this;
    if (that.options.isReadOnly) return;
    that._incrementNumberOfAnnotationsInCurrentWindow(1);
    that._updateLastAnnotationTime();
    var metadata = metadata !== undefined ? metadata : {};
    if (channels && !channels.length) {
      channels = [channels];
    }

    const context = that.options.context;

    if (!annotationId || !Annotations.findOne(annotationId)) {
      
      var graph = $(".graph");
      var annotationDocument = {
        assignment: that.options.context.assignment._id,
        user: Meteor.userId(),
        dataFiles: that.options.context.dataset.map((data) => data._id),
        type: "SIGNAL_ANNOTATION",
        value: {
          label: type,
          confidence: confidence,
          position: {
            channels: channels,
            start: parseFloat(start),
            end: parseFloat(end),
          },
          metadata: {
            recording: that.options.recordingName,
            channels_displayed: that._getChannelsDisplayed(),
            comment: comment,
            annotationLabel: annotationLabel,
            metadata: metadata,
            annotatorConfig: {
              task: that.options.context.task.annotatorConfig,
              preferences: that.options.context.preferences.annotatorConfig,
            },
            graph: {
              width: graph.width(),
              height: graph.height(),
            },
          },
        },
        rationale: rationale,
      };
      that._addArbitrationInformationToObject(annotationDocument);
      // console.log(annotationDocument);
      annotationDocument.id = Annotations.insert(
        annotationDocument,
        (error, annotationId) => {
          that._updateMarkAssignmentAsCompletedButtonState();
          if (error) {
            console.error(error);
            if (!Roles.userIsInRole(Meteor.userId(), "tester")) {
              alert(error.message);
            }
            return;
          }
        }
      );
      // that.vars.annotationIDSet.add(annotationDocument.id);

      that._updateMarkAssignmentAsCompletedButtonState();
      updateCache(annotationDocument);
    } else {
      // console.log("here");

      // console.log("annotationId: " + annotationId);
      // console.log("recording_name: " + recording_name);
      // console.log("type: " + type);
      // console.log("start: " + start);
      // console.log("end: " + end);
      // console.log("channels: " + channels);
      // console.log("confidence: " + confidence);
      // console.log("comment: " + comment);
      // console.log("metadata: " + metadata);
      // console.log("label: " + annotationLabel);
      // console.log("rationale: " + rationale);

      that.vars.annotationIDSet.add(annotationId);

      const annotationModifier = {
        "value.metadata.annotationLabel": annotationLabel,
        "value.label": type,
        "value.confidence": confidence,
        "value.metadata.comment": comment,
        "value.position.channels": channels,
        "value.position.start": start,
        "value.position.end": end,
        rationale: rationale,
      };
      that._addArbitrationInformationToObject(annotationModifier);
      //TODO: BUG HERE - if the with regards to id
      // console.log(annotationModifier);
      Annotations.update(
        annotationId,
        { $set: annotationModifier },
        (error, numAnnotationsUpdated) => {
          that._updateMarkAssignmentAsCompletedButtonState();
          if (error) {
            console.error(error);
            if (!Roles.userIsInRole(Meteor.userId(), "tester")) {
              alert(error.message);
            }
            return;
          }
          var annotationDocument = Annotations.findOne(annotationId);
          if (annotationDocument) {
            annotationDocument.id = annotationDocument._id;
            updateCache(annotationDocument);
          }
          
        }
      );
      that._updateMarkAssignmentAsCompletedButtonState();
    }
    function updateCache(annotation) {
      var key = that._getAnnotationsCacheKey(
        recording_name,
        annotation.value.position.start,
        annotation.value.position.end,
        false
      );
      var cacheEntry = that.vars.annotationsCache[key];
      if (!cacheEntry) {
        cacheEntry = {
          annotations: [],
        };
      }

      // console.log(cacheEntry);
      if (cacheEntry.annotations) {
        cacheEntry.annotations.unshift(annotation.value);
      }
      that.vars.annotationsCache[key] = cacheEntry;
      callback && callback(annotation, null);
    }
  },

  _deleteAnnotation: function (
    annotationId,
    recording_name,
    start,
    end,
    channels,
    channelsDisplayed
  ) {
    var that = this;
    if (that.options.isReadOnly) return;
    that._incrementNumberOfAnnotationsInCurrentWindow(-1);
    that._updateLastAnnotationTime();
    Annotations.remove(annotationId, (error, numAnnotationsRemoved) => {
      if (error) {
        console.error(error);
        if (!Roles.userIsInRole(Meteor.userId(), "tester")) {
          alert(error.message);
        }
        return;
      }
    });
  },

  _incrementNumberOfAnnotationsInCurrentWindow: function (increment) {
    var that = this;
    that._setNumberOfAnnotationsInCurrentWindow(
      that.vars.numberOfAnnotationsInCurrentWindow + increment
    );
  },

  _setNumberOfAnnotationsInCurrentWindow: function (value) {
    var that = this;
    that.vars.numberOfAnnotationsInCurrentWindow = Math.max(0, value);
    var zeroAnnotations = that.vars.numberOfAnnotationsInCurrentWindow == 0;
    $(".no-features").prop("disabled", !zeroAnnotations);
    $(that.element).find(".submit-features").prop("disabled", zeroAnnotations);
  },

  _lastWindowReached: function () {
    var that = this;
    if (!that.vars.lastWindowHasBeenReachedBefore) {
      that._lastWindowReachedForTheFirstTime();
    }
    that.vars.lastWindowHasBeenReachedBefore = true;
    $(".next-window").hide();
  },

  _lastWindowReachedForTheFirstTime: function () {
    var that = this;
    if (that.options.showConfirmationCode && that.options.confirmationCode) {
      var code = that.options.confirmationCode;
      var textCompletionButton = "Show Confirmation Code";
      var confirmationCodeInstructions =
        "You need to copy and paste your confirmation code into the input field on the Mechanical Turk instructions page and submit in order to receive the full payment for this task.";
      if (!that._isHITModeEnabled()) {
        bootbox
          .alert(
            '<div style="text-align: left;">This is the last data window. Please annotate it just like you did with the others. After that, please click the green button saying "<b>' +
              textCompletionButton +
              '</b>" to get your confirmation code and finish the task.<br><br><span style="color: #ff0000; font-weight: bold;">Important: ' +
              confirmationCodeInstructions +
              "</span>",
            showCompletionButton
          )
          .appendTo(that.element);
      } else {
        $(that.element)
          .find(".submit-annotations")
          .add(".next-window")
          .click(function () {
            showCompletionButton();
            showConfirmationCode();
          });
      }

      function showCompletionButton() {
        $(".graph_footer .middle").children().hide();
        var taskCompletionCodeButton = $("<button>")
          .addClass("btn btn-success")
          .html(textCompletionButton)
          .click(function () {
            showConfirmationCode();
          })
          .appendTo(".graph_footer .middle");
      }

      function showConfirmationCode() {
        completeProgressBar();
        bootbox
          .alert({
            title: "Thank you for completing the task!",
            message:
              'Your confirmation code is:<br><br><span style="color: #ff0000; font-weight: bold; font-size: 30px">' +
              code +
              "</span><br><br>" +
              confirmationCodeInstructions +
              "<br><br>After that, you can simply close this tab. Thank you for your participation!",
          })
          .appendTo(that.element);
      }

      function completeProgressBar() {
        $(".progress-bar").css("width", "100%");
      }
    }
  },

  _paintCrosshairGeneral: function (e, crosshairPosition, firstIndexOfChannel, lastIndexOfChannel) {
    var that = this;
    let chart = that.vars.chart;
        _crosshair = chart.renderer.g().add();
        // crosshairPosition = [that.vars.annotationCrosshairPosition];
        crosshairPosition.forEach((crosshair) => {
          if (!that._isInCrosshairWindow(crosshair)) return;
          let left = chart.plotLeft;
          let top = chart.plotTop;
          let height = chart.plotHeight;
          let heightPerChannel =
            height / that.vars.currentWindowData.channels.length;

          let crosshairTop = firstIndexOfChannel * heightPerChannel;
          let crosshairBottom = (lastIndexOfChannel + 1) * heightPerChannel;
          // draw the crosshair using svgPath and add it as a highchart SVGElement
          let svgPath = [
            "M",
            left + crosshair.plotX,
            top + crosshairTop,
            "L",
            left + crosshair.plotX,
            top + crosshairBottom,
          ];
          chart.renderer
            .path(svgPath)
            .attr({
              "stroke-width": 3,
              stroke: "red",
            })
            .add(_crosshair);
        });
      return _crosshair;
  },

  _downloadCSV: function () {
    var that = this;
    var annotations = that._objectsToCSV(that._assembleAnnotationObject());
    // console.log(annotations);
    const blob = new Blob(annotations, {type: "text/csv"});
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"),
      {
        href,
        style: "display:none",
        download: "annotations.csv",
      }
    )
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(href);
    a.remove();
  },

  _downloadJSON: function () {
    var that = this;
    // console.log(annotations);
    var obj = that.options.context.preferences.annotatorConfig.channelTimeshift;
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "alignment.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  _assembleAnnotationObject: function () {
    var that = this;
    var allAnnotations = that.vars.chart.annotations.allItems;
    allAnnotations.sort((a, b) => {
      return that._getAnnotationXMinFixed(a) - that._getAnnotationXMinFixed(b);
    });

    var rows = allAnnotations.filter(element => element.metadata.displayType!="ChangePoint").map( (element, index) => {
      var type;
      var channel;
      var duration = 'NA';
      var annotation = element.metadata.annotationLabel;

      if (element.metadata.displayType == 'ChangePointAll') {
        type = "Stage Change";
        channel = "All";
      } else {
        type = "Event";
        channel = element.metadata.channelIndices.length === that.vars.allChannels.length ? "All" :
        (element.metadata.channelIndices.map((element) => {
          return `(${element})` + that.vars.currentWindowData.channels[element].name;
        })).join('/');
        if (element.metadata.displayType != 'ChangePoint') {
          duration = element.options.shape.params.width;
        }
      }

      if (element.metadata.annotationLabel == "(unanalyzable)") {
        type = 'Signal Quality';
      }

      var row = {
        "Index": index,
        "Time": element.options.xValue,
        "Type": type,
        "Annotation": annotation,
        "Channels": channel,
        "Duration": duration,
        "User": element.metadata.creator,
        "Comment": 
        // element.metadata.comment.replaceAll(',', '-').replaceAll(';', '--') || 
        "",
        // "ID": element.metadata.id,
        // "DisplayType": element.metadata.displayType,
      };
      return row;
    }

  );
  return rows;

  },

  _objectsToCSV: function (arr) {
    if (arr[0]) {
      const array = [Object.keys(arr[0])].concat(arr)
      return [array.map(row => {
          return Object.values(row).map(value => {
              return value;
              // return typeof value === 'string' ? JSON.stringify(value) : value
          })
          // .toString()
      }).join('\n')]
    }
    else return [];  
  },


  _parseFile: function () {
    var that = this;
    const csvFile = document.getElementById("File");
    console.log(csvFile.files);

    var alignmentLoaded = false;
    
    for (let i = 0; i < csvFile.files.length; i++) {

      const input = csvFile.files[i];

      if (input) {
        const reader = new FileReader();
  
        reader.onload = function (e) {
          if (input.type === "text/csv") {
            const text = e.target.result;
            console.log(text);
            const data = that._CSVToArray(text);
            that._redrawAnnotationsFromObjects(data);
          } else if (input.type === "application/json" && !alignmentLoaded) {
            const text = e.target.result;
            console.log(text);
            const data = JSON.parse(text);
            diff = data[Object.keys(data)[0]];
            that._performOffsetSync();
            that._performCrosshairSync(diff);
            alignmentLoaded = true;           
          } 
          // else {
          //   console.log("initiating file upload");

          //   var uploadInstance = EDFFile.insert({
          //     file: input,
          //     chunkSize: 'dynamic'
          //   }, false);
    
          //   uploadInstance.on('end', function(error, fileObj) {
          //     if (error) {
          //       window.alert('Error during upload: ' + error.reason);
          //     } else {
          //       window.alert('File "' + fileObj.name + '" successfully uploaded');
          //       console.log(uploadInstance.config.fileId);

          //       const recordingPath = `/uploaded/${uploadInstance.config.fileId}.edf`;

          //       // const metadataEDF = Meteor.call("get.edf.metadata", recordingPath);
          //       // const metadata = {
          //       //   wfdbdesc: metadataEDF,
          //       // };
          //       // console.log(metadata);
                
          //       let fileObjSplit = fileObj.name.split("-");

          //       console.log(fileObjSplit[0]);

          //       var dataDocument = {
          //         name: fileObj.name,
          //         type: "EDF",
          //         source: fileObjSplit[1].split(".")[0].toUpperCase(),
          //         patient: fileObjSplit[0],
          //         path: recordingPath,
          //         // metadata: metadata,
          //       }

          //       var dataId = Data.insert(dataDocument);
          //       console.log(dataId);
          //     }
          //   });
    
          //   uploadInstance.start();
          
          // }
        };
        reader.readAsText(input);
      }
    }
  },

  _CSVToArray: function(str, delimiter = ",") {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  
    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  
    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
      const values = row.split(delimiter);
      // console.log(values);
      const el = headers.reduce(function (object, header, index) {
        object[header] = (
          header === 'Time' || header === 'Duration' 
        ) ? parseFloat(values[index]) : 
        header === 'Index' ? parseInt(values[index]) : values[index];
        return object;
      }, {});
      return el;
    });
  
    // return the array
    return arr;
  },

  _redrawAnnotationsFromObjects: function(objArr) {
    var that = this;

    let set = new Set();
    that.vars.chart.annotations.allItems.forEach((element) => {
      set.add(String(element.options.xValue)+element.metadata.annotationLabel);
    })
    objArr.forEach((element) => {
      if (!set.has(String(element["Time"].toFixed(2))+element["Annotation"])) {
        if (element["Type"] != "Stage Change") {
          console.log(element)
          that._redrawEventAnnotationFromObject(element);
        } else {
          that._redrawChangePointAnnotationFromObject(element);
        }
      }
    })
  },

  _redrawEventAnnotationFromObject: function(obj) {
    var that = this;
    console.log(obj["Channels"]);
    let channels = obj["Channels"] === "All" ? that.vars.allChannels.map((element, index)=>index) :  
      obj["Channels"].split("/").map((element) => 
      {return parseInt(element.split(")")[0].substring(1))});
    
    let timeStart = obj["Time"];
    var { height, yValue } =
      that._getAnnotationBoxHeightAndYValueForChannelIndices(channels);
    
      let newAnnotation = that._addAnnotationBox(
        undefined,
        timeStart,
        channels,
        undefined,
      );

      newAnnotation.update({
        xValue: timeStart,
        yValue: yValue,
        shape: {
          params: {
            width: obj["Duration"],
            height: height,
          },
        },
      })

      newAnnotation.metadata.annotationLabel = obj["Annotation"];
      // newAnnotation.metadata.id = obj["ID"];
      newAnnotation.metadata.comment = obj["Comment"];
      newAnnotation.metadata.creator = obj["User"];
      that._saveFeatureAnnotation(newAnnotation);
      that._updateChangePointLabelRight(newAnnotation);
  },

  _redrawChangePointAnnotationFromObject: function(obj) {
    var that = this;    

    console.log(obj["Time"]);
    let newAnnotation = that._addAnnotationChangePointAll(obj["Time"], fromObject=true);
    newAnnotation.metadata.annotationLabel = obj["Annotation"];
    newAnnotation.metadata.comment = obj["Comment"];
    newAnnotation.metadata.creator = obj["User"];
    that._saveFeatureAnnotation(newAnnotation);
    that._updateChangePointLabelRight(newAnnotation);
    that._updateChangePointLabelLeft(newAnnotation);
  },

  _stringToColour: function(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      var colour = '#';
      for (var i = 0; i < 3; i++) {
          var value = (hash >> (i * 8)) & 0xFF;
          colour += ('00' + value.toString(16)).substr(-2);
      }
      console.log(colour);
      console.log(this._newColorShade(colour,-150));
      return colour;
  },

  // _parseAnnotationDocuments: function(documents) {
  //   // Parse annotation documents into object format to be redrawn
  //   var that = this;
  //   var annotations = [];
  //   documents.forEach( element => {

  //     let channels = element.position.channels;
  //     let duration = element.position.end - element.position.start;

  //     let type;
  //     if (duration === 0) {
  //       if (channels.length < that.vars.allChannels.length) {
  //         return;
  //       }
  //       type = "Stage Change";
  //     }

  //     let time = element.position.start;
  //     let annotationLabel = element.metadata.annotationLabel;
  //     let user = "aaa";
  //     let comment = element.metadata.comment;

  //     var annotation = {
  //       "Time": time,
  //       "Type": type,
  //       "Annotation": annotationLabel,
  //       "Channels": channels,
  //       "Duration": duration,
  //       "User": user,
  //       "Comment": comment,
  //       // "ID": element.metadata.id,
  //       // "DisplayType": element.metadata.displayType,
  //     };
  //   })

  // },


  _collapseObjectToArray: function(object) {
    var array = [];
    for (const property in object) {
      array.push(...object[property]);
    }
    return array;
  }


  
});
