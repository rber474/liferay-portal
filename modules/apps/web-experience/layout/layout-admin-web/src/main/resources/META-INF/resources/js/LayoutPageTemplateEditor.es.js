import Component from 'metal-component';
import debounce from 'metal-debounce';
import {Config} from 'metal-state';
import Soy from 'metal-soy';

import './contextual_sidebar/ContextualSidebar.es';
import './LayoutPageTemplateFragment.es';
import './LayoutPageTemplateFragmentCollection.es';
import './LayoutPageTemplateSidebarAddedFragment.es';
import templates from './LayoutPageTemplateEditor.soy';

/**
 * Component that allows creating/editing Layout Page Templates
 */
class LayoutPageTemplateEditor extends Component {
	/**
	 * @inheritDoc
	 */
	created() {
		this._updatePageTemplate = this._updatePageTemplate.bind(this);
		this._updatePageTemplate = debounce(this._updatePageTemplate, 1000);
	}

	/**
	 * @inheritDoc
	 * If there are changes on any fragment, it sets the _dirty property
	 * to true and queues an update.
	 */
	shouldUpdate(changes) {
		if (changes.fragments) {
			this._dirty = true;
			this._updatePageTemplate();
		}

		return true;
	}

	/**
	 * Callback executed when a fragment entry of a collection is clicked.
	 * It receives fragmentEntryId and fragmentName as event data.
	 * @param {Event} event
	 * @private
	 */
	_handleFragmentCollectionEntryClick(event) {
		this.fragments = [
			...this.fragments,
			{
				fragmentEntryId: event.fragmentEntryId,
				name: event.fragmentName,
				config: {},
			},
		];
	}

	/**
	 * Removes a fragment from the fragment list. The fragment to
	 * be removed should be specified inside the event as fragmentIndex
	 * @param {Event} event
	 * @private
	 */
	_handleFragmentRemoveButtonClick(event) {
		const index = event.fragmentIndex;

		this.fragments = [
			...this.fragments.slice(0, index),
			...this.fragments.slice(index + 1),
		];
	}

	/**
	 * Callback executed when the sidebar should be hidden
	 * @private
	 */
	_handleHideContextualSidebar() {
		this._contextualSidebarVisible = false;
	}

	/**
	 * Updates _sidebarSelectedTab according to the clicked element
	 * @param {Event} event
	 * @private
	 */
	_handleSidebarTabClick(event) {
		this._sidebarSelectedTab = event.delegateTarget.dataset.tabName;
	}

	/**
	 * Callback executed when the sidebar visible state should be toggled
	 * @private
	 */
	_handleToggleContextualSidebarButtonClick() {
		this._contextualSidebarVisible = !this._contextualSidebarVisible;
	}

	/**
	 * Sends the page template accumulated changes to the server and, if
	 * success, sets the _dirty property to false.
	 * @private
	 */
	_updatePageTemplate() {
		this._dirty = false;

		const body = new FormData();

		body.append(
			`${this.portletNamespace}layoutPageTemplateEntryId`,
			this.layoutPageTemplateEntryId
		);

		this.fragments.forEach(fragment => {
			body.append(
				`${this.portletNamespace}fragmentIds`,
				fragment.fragmentEntryId
			);
		});

		fetch(this.updatePageTemplateURL, {
			body,
			credentials: 'include',
			method: 'POST',
		}).then(() => {
			this._lastSaveDate = new Date().toLocaleTimeString();
			this._dirty = false;
		});
	}
}

/**
 * Tabs that can appear inside the sidebar
 * @see LayoutPageTemplateEditor._sidebarTabs
 */
const SIDEBAR_TABS = [
	{
		id: 'fragments',
		name: Liferay.Language.get('fragments'),
		visible: true,
	},
	{
		id: 'added',
		name: Liferay.Language.get('added'),
		visible: true,
	},
];

/**
 * State definition.
 * @type {!Object}
 * @static
 */
LayoutPageTemplateEditor.STATE = {
	/**
	 * Available entries that can be dragged inside the existing
	 * Layout Page Template, organized by fragment categories.
	 * @default undefined
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {!Array<object>}
	 */
	fragmentCollections: Config.arrayOf(
		Config.shapeOf({
			fragmentCollectionId: Config.string().required(),
			name: Config.string().required(),
			entries: Config.arrayOf(
				Config.shapeOf({
					fragmentEntryId: Config.string().required(),
					name: Config.string().required(),
				})
			).required(),
		})
	).required(),

	/**
	 * Optional ID provided by the template system.
	 * @default ''
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {string}
	 */
	id: Config.string().value(''),

	/**
	 * List of fragment instances part of the Layout Page Template, the order
	 * of the elements in this array defines their position.
	 * @default []
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {Array<string>}
	 */
	fragments: Config.arrayOf(
		Config.shapeOf({
			fragmentEntryId: Config.string().required(),
			name: Config.string().required(),
			config: Config.object().value({}),
		})
	).value([]),

	/**
	 * Layout page template entry id used for storing changes.
	 * @default undefined
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {!string}
	 */
	layoutPageTemplateEntryId: Config.string().required(),

	/**
	 * Portlet namespace needed for prefixing form inputs
	 * @default undefined
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {!string}
	 */
	portletNamespace: Config.string().required(),

	/**
	 * URL for getting a fragment content.
	 * @default undefined
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {!string}
	 */
	renderFragmentEntryURL: Config.string().required(),

	/**
	 * Path of the available icons.
	 * @default undefined
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {!string}
	 */
	spritemap: Config.string().required(),

	/**
	 * URL for updating the layout page template.
	 * @default undefined
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @type {!string}
	 */
	updatePageTemplateURL: Config.string().required(),

	/**
	 * Allow opening/closing contextual sidebar
	 * @default true
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @private
	 * @type {boolean}
	 */
	_contextualSidebarVisible: Config.bool()
		.internal()
		.value(true),

	/**
	 * When true, it indicates that are changes pending to save.
	 * @default false
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @private
	 * @type {bool}
	 */
	_dirty: Config.bool()
		.internal()
		.value(false),

	/**
	 * Last data when the autosave has been executed.
	 * @default ''
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @private
	 * @type {string}
	 */
	_lastSaveDate: Config.string()
		.internal()
		.value(''),

	/**
	 * Tabs being shown in sidebar
	 * @default SIDEBAR_TABS
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @private
	 * @type {Array<{
	 * 	 id:string,
	 * 	 name:string,
	 * 	 visible:boolean
	 * }>}
	 */
	_sidebarTabs: Config.arrayOf(
		Config.shapeOf({
			id: Config.string(),
			name: Config.string(),
			visible: Config.bool(),
		})
	)
		.internal()
		.value(SIDEBAR_TABS),

	/**
	 * Tab selected inside sidebar
	 * @default SIDEBAR_TABS[0].id
	 * @instance
	 * @memberOf LayoutPageTemplateEditor
	 * @private
	 * @type {string}
	 */
	_sidebarSelectedTab: Config.oneOf(SIDEBAR_TABS.map(tab => tab.id))
		.internal()
		.value(SIDEBAR_TABS[0].id),
};

Soy.register(LayoutPageTemplateEditor, templates);

export {LayoutPageTemplateEditor};
export default LayoutPageTemplateEditor;
