import Ember from 'ember';
import V3Serializer from 'travis/serializers/v3';

export default V3Serializer.extend({
  isNewSerializerAPI: true,

  extractRelationships(modelClass, resourceHash) {
    if(resourceHash['@type']) {
      return this._super(...arguments);
    } else {
      let relationships = {};

      modelClass.eachRelationship((key, relationshipMeta) => {
        // V2 API payload
        let relationship = null;
        let relationshipKey = this.keyForV2Relationship(key, relationshipMeta.kind, 'deserialize');

        if (resourceHash.hasOwnProperty(relationshipKey)) {
          let data = null;
          let relationshipHash = resourceHash[relationshipKey];
          if (relationshipMeta.kind === 'belongsTo') {
            data = this.extractRelationship(relationshipMeta.type, relationshipHash);
          } else if (relationshipMeta.kind === 'hasMany') {
            data = relationshipHash.map((item) => this.extractRelationship(relationshipMeta.type, item));
          }
          relationship = { data };
        }

        if (relationship) {
          relationships[key] = relationship;
        }
      });

      return relationships;
    }
  },

  normalize(modelClass, resourceHash) {
    if(resourceHash['@type']) {
      return this._super(...arguments);
    } else {
      var modelKey = modelClass.modelName;
      var attributes = resourceHash[modelKey];
      if(attributes) {
        for(var key in attributes) {
          resourceHash[key] = attributes[key];
        };

        resourceHash['@type'] = modelKey;
        resourceHash['type'] = modelKey;
        delete resourceHash[modelKey];
      }

      return this._super(modelClass, resourceHash);
    }
  },

  keyForV2Relationship(key, typeClass, method) {
    return key.underscore() + '_id';
  }
});
