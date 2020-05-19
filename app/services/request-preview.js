import Service, { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';
import { notEmpty, reads, or } from '@ember/object/computed';
import config from 'travis/config/environment';

export default Service.extend({
  store: service(),

  loading: reads('loadConfigs.isRunning'),
  loaded: notEmpty('record'),
  record: reads('loadConfigs.lastSuccessful.value'),
  config: reads('record.config'),
  rawConfigs: reads('record.rawConfigs'),
  jobConfigs: reads('record.jobConfigs'),
  errorMessages: computed(() => []),
  messages: or('record.messages', 'errorMessages'),

  loadConfigs: task(function* (data, debounce) {
    if (debounce) {
      const { searchDebounceRate } = config.intervals;
      yield timeout(searchDebounceRate);
    }

    try {
      const repo = yield this.store.findRecord('repo', data.repo.get('id'));
      const record = this.store.createRecord('request-preview', { ...data, repo });
      yield record.save();
      return record;
    } catch (e) {
      // TODO for some reason this still logs the 400 request as an error to the console
      this.handleLoadConfigError(e);
    }
  }).restartable(),

  handleLoadConfigError(e) {
    const error = e.errors[0];
    const msg = { level: 'error', code: error.title, args: { message: error.detail } };
    this.set('record', null);
    this.set('errorMessages', [msg]);
  },

  reset() {
    this.loadConfigs.cancelAll({ resetState: true });
  }
});
