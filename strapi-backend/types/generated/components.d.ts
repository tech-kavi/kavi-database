import type { Schema, Struct } from '@strapi/strapi';

export interface ExperienceExperience extends Struct.ComponentSchema {
  collectionName: 'components_experience_experiences';
  info: {
    displayName: 'Experience';
  };
  attributes: {
    company: Schema.Attribute.Relation<'oneToOne', 'api::company.company'>;
    designation: Schema.Attribute.String;
    end_date: Schema.Attribute.Date;
    engagement_status: Schema.Attribute.Enumeration<
      [
        'Uncontacted',
        'No response',
        'Contacted but not screened',
        'Contacted & screened',
        'Sent to client',
        'Negotiation',
        'Contacted but ghosting',
        'Six month rule',
        'Out of budget',
        'NDA',
        'Not interested at all',
        'Not interested in project',
        'Call scheduled',
        'Call done',
      ]
    >;
    original_quote: Schema.Attribute.Integer;
    source_of_response: Schema.Attribute.Enumeration<
      ['Cold calling', 'Email', 'Linkedin', 'Others']
    >;
    start_date: Schema.Attribute.Date;
    target_company: Schema.Attribute.Relation<
      'oneToOne',
      'api::company.company'
    >;
    type: Schema.Attribute.Enumeration<
      ['Former', 'Partner', 'Customer', 'Competitor']
    >;
    upload_file_details: Schema.Attribute.String;
  };
}

export interface RelatedProjectRelatedProject extends Struct.ComponentSchema {
  collectionName: 'components_related_project_related_projects';
  info: {
    displayName: 'related_project';
  };
  attributes: {
    ca: Schema.Attribute.String;
    final_amount: Schema.Attribute.Integer;
    investor: Schema.Attribute.String;
    project_code: Schema.Attribute.String;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'experience.experience': ExperienceExperience;
      'related-project.related-project': RelatedProjectRelatedProject;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
