import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  router: service(),

  // Public interface
  variant: 'link-underlined',

  // External Route Version
  href: null,
  rel: 'noopener noreferrer',
  target: '_blank',

  // Internal Route Version
  route: null,
  activeVariant: null,

  isActive: computed('route', 'router.currentRouteName', function () {
    return this.router.isActive(this.route);
  }),
  currentVariant: computed('isActive', 'activeVariant', 'variant', function () {
    return this.isActive ? this.activeVariant : this.variant;
  }),

});
