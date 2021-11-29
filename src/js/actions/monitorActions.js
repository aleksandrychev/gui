import { commonErrorFallback, commonErrorHandler, setSnackbar } from './appActions';
import Api, { headerNames } from '../api/general-api';
import MonitorConstants from '../constants/monitorConstants';
import { convertDeviceListStateToFilters, getSearchEndpoint } from './deviceActions';

const apiUrlv1 = '/api/management/v1';
export const monitorApiUrlv1 = `${apiUrlv1}/devicemonitor`;

const defaultPerPage = 20;
const defaultPage = 1;

const cutoffLength = 75;
const ellipsis = '...';

const longTextTrimmer = text => (text.length >= cutoffLength + ellipsis.length ? `${text.substring(0, cutoffLength + ellipsis.length)}${ellipsis}` : text);

const sanitizeDeviceAlerts = alerts => alerts.map(alert => ({ ...alert, fullName: alert.name, name: longTextTrimmer(alert.name) }));

export const getDeviceAlerts =
  (id, config = {}) =>
  dispatch => {
    const { page = defaultPage, perPage = defaultPerPage, issuedBefore, issuedAfter, sortAscending = false } = config;
    const issued_after = issuedAfter ? `&issued_after=${issuedAfter}` : '';
    const issued_before = issuedBefore ? `&issued_before=${issuedBefore}` : '';
    return Api.get(`${monitorApiUrlv1}/devices/${id}/alerts?page=${page}&per_page=${perPage}${issued_after}${issued_before}&sort_ascending=${sortAscending}`)
      .catch(err => commonErrorHandler(err, `Retrieving device alerts for device ${id} failed:`, dispatch))
      .then(res =>
        Promise.resolve(
          dispatch({
            type: MonitorConstants.RECEIVE_DEVICE_ALERTS,
            deviceId: id,
            alerts: sanitizeDeviceAlerts(res.data)
          })
        )
      );
  };

export const getLatestDeviceAlerts =
  (id, config = {}) =>
  dispatch => {
    const { page = defaultPage, perPage = 10 } = config;
    return Api.get(`${monitorApiUrlv1}/devices/${id}/alerts/latest?page=${page}&per_page=${perPage}`)
      .catch(err => commonErrorHandler(err, `Retrieving device alerts for device ${id} failed:`, dispatch))
      .then(res =>
        Promise.resolve(
          dispatch({
            type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS,
            deviceId: id,
            alerts: sanitizeDeviceAlerts(res.data)
          })
        )
      );
  };

export const getIssueCountsByType =
  (type, options = {}) =>
  (dispatch, getState) => {
    const state = getState();
    const { filters = state.devices.filters, group, status } = options;
    const { applicableFilters: nonMonitorFilters, filterTerms } = convertDeviceListStateToFilters({
      filters,
      group,
      selectedIssues: [type],
      status
    });
    return Api.post(getSearchEndpoint(state.app.features.hasReporting), {
      page: 1,
      per_page: 1,
      filters: filterTerms,
      attributes: [{ scope: 'identity', attribute: 'status' }]
    })
      .catch(err => commonErrorHandler(err, `Retrieving issue counts failed:`, dispatch, commonErrorFallback))
      .then(res => {
        const total = nonMonitorFilters.length ? state.monitor.issueCounts.byType[type].total : Number(res.headers[headerNames.total]);
        const filtered = nonMonitorFilters.length ? Number(res.headers[headerNames.total]) : total;
        return Promise.resolve(
          dispatch({
            counts: { filtered, total },
            issueType: type,
            type: MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS
          })
        );
      });
  };

export const changeNotificationSetting =
  (enabled, channel = MonitorConstants.alertChannels.email) =>
  dispatch => {
    return Api.put(`${monitorApiUrlv1}/settings/global/channel/alerts/${channel}/status`, { enabled })
      .catch(err => commonErrorHandler(err, `${enabled ? 'En' : 'Dis'}abling  ${channel} alerts failed:`, dispatch))
      .then(() =>
        Promise.all([
          dispatch({
            type: MonitorConstants.CHANGE_ALERT_CHANNEL,
            channel,
            enabled
          }),
          dispatch(setSnackbar(`Successfully ${enabled ? 'en' : 'dis'}abled ${channel} alerts`, 5000))
        ])
      );
  };
