import { hash } from 'rsvp';
import TravisRoute from 'travis/routes/basic';
import { inject as service } from '@ember/service';
import TailwindBaseMixin from 'travis/mixins/tailwind-base';

export default TravisRoute.extend(TailwindBaseMixin, {
  needsAuth: true,

  features: service(),
  accounts: service(),

  model(params) {
    return hash({
      starredRepos: this.store.filter('repo', {
        active: true,
        sort_by: 'current_build:desc',
        starred: true
      }, (repo) => repo.get('starred'), ['starred'], true),
    });
  },
});
