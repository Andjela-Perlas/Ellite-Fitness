import React, { useEffect } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import Lottie from 'react-lottie-player';
import PreviousStepLink from '../../components/util/previous-step-link/index';
import DefaultStep from '../../components/default-step/index';
import ImportLoader from '../../components/import-steps/import-loader';
import ErrorScreen from '../../components/error/index';
import { useStateValue } from '../../store/store';
import lottieJson from '../../../images/website-building.json';
import sseImport from './sse-import';
import {
	installAstra,
	saveTypography,
	setSiteLogo,
	setColorPalettes,
	divideIntoChunks,
	checkRequiredPlugins,
} from './import-utils';

import './style.scss';

const ImportSite = () => {
	const storedState = useStateValue();
	const [
		{
			resetDone,
			importStart,
			importEnd,
			importPercent,
			templateResponse,
			reset,
			themeStatus,
			currentIndex,
			importError,
			resetCustomizer,
			resetSiteOptions,
			resetContent,
			resetWidgets,
			siteLogo,
			activePalette,
			typography,
			customizerImportFlag,
			widgetImportFlag,
			contentImportFlag,
			themeActivateFlag,
			requiredPluginsDone,
			requiredPlugins,
			notInstalledList,
			notActivatedList,
			tryAgainCount,
		},
		dispatch,
	] = storedState;

	let percentage = importPercent;

	/**
	 *
	 * @param {string} primary   Primary text for the error.
	 * @param {string} secondary Secondary text for the error.
	 * @param {string} text      Text received from the AJAX call.
	 * @param {string} code      Error code received from the AJAX call.
	 * @param {string} solution  Solution provided for the current error.
	 */
	const report = (
		primary = '',
		secondary = '',
		text = '',
		code = '',
		solution = '',
		stack = ''
	) => {
		dispatch( {
			type: 'set',
			importError: true,
			importErrorMessages: {
				primaryText: primary,
				secondaryText: secondary,
				errorCode: code,
				errorText: text,
				solutionText: solution,
				tryAgain: true,
			},
		} );

		localStorage.removeItem( 'st-import-start' );
		localStorage.removeItem( 'st-import-end' );

		sendErrorReport(
			primary,
			secondary,
			text,
			code,
			solution,
			stack,
			tryAgainCount
		);
	};

	const sendErrorReport = (
		primary = '',
		secondary = '',
		text = '',
		code = '',
		solution = '',
		stack = ''
	) => {
		const reportErr = new FormData();
		reportErr.append( 'action', 'report_error' );
		reportErr.append(
			'error',
			JSON.stringify( {
				primaryText: primary,
				secondaryText: secondary,
				errorCode: code,
				errorText: text,
				solutionText: solution,
				tryAgain: true,
				stack,
				tryAgainCount,
			} )
		);
		reportErr.append( 'id', templateResponse.id );
		reportErr.append( 'plugins', JSON.stringify( requiredPlugins ) );
		fetch( ajaxurl, {
			method: 'post',
			body: reportErr,
		} );
	};

	/**
	 * Start Import.
	 */
	const startImport = () => {
		percentage += 5;

		dispatch( {
			type: 'set',
			importStart: true,
			importPercent: percentage,
			importStatus: __( 'Starting Import.', 'astra-sites' ),
		} );

		installRequiredPlugins();
	};

	/**
	 * Install Required plugins.
	 */
	const installRequiredPlugins = () => {
		// Install Bulk.
		if ( notInstalledList.length <= 0 ) {
			return;
		}

		percentage += 2;
		dispatch( {
			type: 'set',
			importStatus: __( 'Installing Required Plugins.', 'astra-sites' ),
			importPercent: percentage,
		} );

		notInstalledList.forEach( ( plugin ) => {
			wp.updates.queue.push( {
				action: 'install-plugin', // Required action.
				data: {
					slug: plugin.slug,
					init: plugin.init,
					name: plugin.name,
					clear_destination: true,
					success() {
						dispatch( {
							type: 'set',
							importStatus: sprintf(
								// translators: Plugin Name.
								__(
									'%1$s plugin installed successfully.',
									'astra-sites'
								),
								plugin.name
							),
						} );

						const inactiveList = notActivatedList;
						inactiveList.push( plugin );

						dispatch( {
							type: 'set',
							notActivatedList: inactiveList,
						} );
						const notInstalledPluginList = notInstalledList;
						notInstalledPluginList.forEach(
							( singlePlugin, index ) => {
								if ( singlePlugin.slug === plugin.slug ) {
									notInstalledPluginList.splice( index, 1 );
								}
							}
						);
						dispatch( {
							type: 'set',
							notInstalledList: notInstalledPluginList,
						} );
					},
					error( err ) {
						report(
							__(
								'Could not install the plugin list.',
								'astra-sites'
							),
							'',
							err
						);
					},
				},
			} );
		} );

		// Required to set queue.
		wp.updates.queueChecker();
	};

	/**
	 * Activate Plugin
	 */
	const activatePlugin = ( plugin ) => {
		percentage += 2;
		dispatch( {
			type: 'set',
			importStatus: sprintf(
				// translators: Plugin Name.
				__( 'Activating %1$s plugin.', 'astra-sites' ),
				plugin.name
			),
			importPercent: percentage,
		} );

		const activatePluginOptions = new FormData();
		activatePluginOptions.append(
			'action',
			'astra-required-plugin-activate'
		);
		activatePluginOptions.append( 'init', plugin.init );
		activatePluginOptions.append(
			'_ajax_nonce',
			astraSitesVars._ajax_nonce
		);
		fetch( ajaxurl, {
			method: 'post',
			body: activatePluginOptions,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneResponse = [];
				try {
					const response = JSON.parse( text );
					cloneResponse = response;
					if ( response.success ) {
						const notActivatedPluginList = notActivatedList;
						notActivatedPluginList.forEach(
							( singlePlugin, index ) => {
								if ( singlePlugin.slug === plugin.slug ) {
									notActivatedPluginList.splice( index, 1 );
								}
							}
						);
						dispatch( {
							type: 'set',
							notActivatedList: notActivatedPluginList,
						} );
						percentage += 2;
						dispatch( {
							type: 'set',
							importStatus: sprintf(
								// translators: Plugin Name.
								__( '%1$s activated.', 'astra-sites' ),
								plugin.name
							),
							importPercent: percentage,
						} );
					}
				} catch ( error ) {
					report(
						__(
							'JSON_Error: Could not activate the required plugin list.',
							'astra-sites'
						),
						'',
						error,
						'',
						sprintf(
							// translators: Support article URL.
							__(
								'<a href="%1$s">Read article</a> to resolve the issue and continue importing template.',
								'astra-sites'
							),
							'https://wpastra.com/docs/enable-debugging-in-wordpress/#how-to-use-debugging'
						),
						text
					);
				}

				if ( ! cloneResponse.success ) {
					throw cloneResponse;
				}
			} )
			.catch( ( error ) => {
				report(
					__(
						'Could not activate the required plugin list.',
						'astra-sites'
					),
					'',
					error?.data?.message,
					'',
					sprintf(
						// translators: Support article URL.
						__(
							'<a href="%1$s">Read article</a> to resolve the issue and continue importing template.',
							'astra-sites'
						),
						'https://wpastra.com/docs/enable-debugging-in-wordpress/#how-to-use-debugging'
					),
					error
				);
			} );
	};

	/**
	 * 1. Reset.
	 */
	const resetOldSite = async () => {
		if ( ! reset ) {
			dispatch( {
				type: 'set',
				resetDone: true,
				resetCustomizer: true,
				resetSiteOptions: true,
				resetContent: true,
				resetWidgets: true,
			} );
			installRequiredPlugins();
			return;
		}
		percentage += 2;
		dispatch( {
			type: 'set',
			importStatus: __( 'Reseting site.', 'astra-sites' ),
			importPercent: percentage,
		} );

		/**
		 * Reset Customizer.
		 */
		await performResetCustomizer();

		/**
		 * Reset Site Options.
		 */
		await performResetSiteOptions();

		/**
		 * Reset Widgets.
		 */
		await performResetWidget();

		/**
		 * Reset Terms, Forms.
		 */
		await performResetTermsAndForms();

		/**
		 * Reset Posts.
		 */
		await performResetPosts();

		percentage += 10;
		dispatch( {
			type: 'set',
			importPercent: percentage,
			resetContent: true,
			resetDone: true,
			importStatus: __( 'Reset for old website is done.', 'astra-sites' ),
		} );
	};

	/**
	 * Reset Terms and Forms.
	 */
	const performResetTermsAndForms = async () => {
		const formOption = new FormData();
		formOption.append( 'action', 'astra-sites-reset-terms-and-forms' );
		formOption.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		dispatch( {
			type: 'set',
			importStatus: __( 'Resetting terms and forms.', 'astra-sites' ),
		} );

		await fetch( ajaxurl, {
			method: 'post',
			body: formOption,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const response = JSON.parse( text );
					cloneData = response;
					if ( response.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
							resetCustomizer: true,
						} );
					}
				} catch ( error ) {
					report(
						__(
							'Resetting terms and forms failed.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}
				if ( ! cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Resetting terms and forms failed.', 'astra-sites' ),
					'',
					error?.message,
					'',
					'',
					error
				);
			} );
	};

	/**
	 * Reset Posts.
	 */
	const performResetPosts = async () => {
		const data = new FormData();
		data.append( 'action', 'astra-sites-get-deleted-post-ids' );
		data.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		dispatch( {
			type: 'set',
			importStatus: __( 'Gathering posts for deletions.', 'astra-sites' ),
		} );

		await fetch( ajaxurl, {
			method: 'post',
			body: data,
		} )
			.then( ( response ) => response.json() )
			.then( async ( response ) => {
				if ( response.success ) {
					const chunkArray = divideIntoChunks( 10, response.data );
					if ( chunkArray.length > 0 ) {
						for (
							let index = 0;
							index < chunkArray.length;
							index++
						) {
							await performPostsReset( chunkArray[ index ] );
						}
					}
				}
			} );

		dispatch( {
			type: 'set',
			importStatus: __( 'Resetting posts done.', 'astra-sites' ),
		} );
	};

	/**
	 * Reset a chunk of posts.
	 */
	const performPostsReset = async ( chunk ) => {
		const data = new FormData();
		data.append( 'action', 'astra-sites-get-deleted-post-ids' );
		data.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		dispatch( {
			type: 'set',
			importStatus: __( `Resetting posts.`, 'astra-sites' ),
		} );

		const formOption = new FormData();
		formOption.append( 'action', 'astra-sites-reset-posts' );
		formOption.append( 'ids', JSON.stringify( chunk ) );
		formOption.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		await fetch( ajaxurl, {
			method: 'post',
			body: formOption,
		} )
			.then( ( resp ) => resp.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const result = JSON.parse( text );
					cloneData = result;
					if ( result.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
						} );
					}
				} catch ( error ) {
					report(
						__( 'Resetting posts failed.', 'astra-sites' ),
						'',
						error,
						'',
						'',
						text
					);
				}
				if ( ! cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Resetting posts failed.', 'astra-sites' ),
					'',
					error?.message,
					'',
					'',
					error
				);
			} );
	};

	/**
	 * Perfoem Reset for Customizer.
	 */
	const performResetCustomizer = async () => {
		dispatch( {
			type: 'set',
			importStatus: __( 'Resetting customizer.', 'astra-sites' ),
		} );

		const customizerContent = new FormData();
		customizerContent.append(
			'action',
			'astra-sites-reset-customizer-data'
		);
		customizerContent.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		await fetch( ajaxurl, {
			method: 'post',
			body: customizerContent,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const response = JSON.parse( text );
					cloneData = response;
					if ( response.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
							resetCustomizer: true,
						} );
					}
				} catch ( error ) {
					report(
						__( 'Resetting customizer failed.', 'astra-sites' ),
						'',
						error?.message,
						'',
						'',
						text
					);
				}
				if ( ! cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Resetting customizer failed.', 'astra-sites' ),
					'',
					error?.message,
					'',
					'',
					error
				);
			} );
	};

	/**
	 * Perform reset
	 */
	const performResetSiteOptions = async () => {
		dispatch( {
			type: 'set',
			importStatus: __( 'Resetting site options.', 'astra-sites' ),
		} );

		const siteOptions = new FormData();
		siteOptions.append( 'action', 'astra-sites-reset-site-options' );
		siteOptions.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		await fetch( ajaxurl, {
			method: 'post',
			body: siteOptions,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
							resetSiteOptions: true,
						} );
					}
				} catch ( error ) {
					report(
						__( 'Resetting site options Failed.', 'astra-sites' ),
						'',
						error?.message,
						'',
						'',
						text
					);
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Resetting site options Failed.', 'astra-sites' ),
					'',
					error?.message,
					'',
					'',
					error
				);
			} );
	};

	/**
	 * Perform Reset for Widgets
	 */
	const performResetWidget = async () => {
		const widgets = new FormData();
		widgets.append( 'action', 'astra-sites-reset-widgets-data' );
		widgets.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		dispatch( {
			type: 'set',
			importStatus: __( 'Resetting widgets.', 'astra-sites' ),
		} );
		await fetch( ajaxurl, {
			method: 'post',
			body: widgets,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const response = JSON.parse( text );
					cloneData = response;
					if ( response.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
							resetWidgets: true,
						} );
					}
				} catch ( error ) {
					report(
						__(
							'Resetting widgets JSON parse failed.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}
				if ( ! cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Resetting widgets failed.', 'astra-sites' ),
					'',
					error,
					'',
					'',
					error
				);
			} );
	};

	/**
	 * 2. Import CartFlows Flows.
	 */
	const importCartflowsFlows = () => {
		const cartflowsUrl =
			encodeURI( templateResponse[ 'astra-site-cartflows-path' ] ) || '';

		if ( '' === cartflowsUrl || 'null' === cartflowsUrl ) {
			importForms();
			return;
		}

		dispatch( {
			type: 'set',
			importStatus: __( 'Importing CartFlows flows.', 'astra-sites' ),
		} );

		const flows = new FormData();
		flows.append( 'action', 'astra-sites-import-cartflows' );
		flows.append( 'cartflows_url', cartflowsUrl );
		flows.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		fetch( ajaxurl, {
			method: 'post',
			body: flows,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
						} );
						importForms();
					}
				} catch ( error ) {
					report(
						__(
							'Importing CartFlows flows failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Importing CartFlows flows Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	/**
	 * 3. Import WPForms.
	 */
	const importForms = () => {
		const wpformsUrl =
			encodeURI( templateResponse[ 'astra-site-wpforms-path' ] ) || '';

		if ( '' === wpformsUrl || 'null' === wpformsUrl ) {
			importCustomizerJson();
			return;
		}

		dispatch( {
			type: 'set',
			importStatus: __( 'Importing forms.', 'astra-sites' ),
		} );

		const flows = new FormData();
		flows.append( 'action', 'astra-sites-import-wpforms' );
		flows.append( 'wpforms_url', wpformsUrl );
		flows.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		fetch( ajaxurl, {
			method: 'post',
			body: flows,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						percentage += 2;
						dispatch( {
							type: 'set',
							importPercent: percentage,
						} );
						importCustomizerJson();
					}
				} catch ( error ) {
					report(
						__(
							'Importing forms failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Importing forms Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	/**
	 * 4. Import Customizer JSON.
	 */
	const importCustomizerJson = () => {
		if ( ! customizerImportFlag ) {
			percentage += 5;
			dispatch( {
				type: 'set',
				importPercent: percentage,
			} );
			importSiteContent();
			return;
		}
		dispatch( {
			type: 'set',
			importStatus: __( 'Importing forms.', 'astra-sites' ),
		} );

		const forms = new FormData();
		forms.append( 'action', 'astra-sites-import-customizer-settings' );
		forms.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		fetch( ajaxurl, {
			method: 'post',
			body: forms,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						percentage += 5;
						dispatch( {
							type: 'set',
							importPercent: percentage,
						} );
						importSiteContent();
					}
				} catch ( error ) {
					report(
						__(
							'Importing Customizer failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Importing Customizer Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	/**
	 * 5. Import Site Comtent XML.
	 */
	const importSiteContent = () => {
		if ( ! contentImportFlag ) {
			percentage += 20;
			dispatch( {
				type: 'set',
				importPercent: percentage,
			} );
			importSiteOptions();
			return;
		}

		const wxrUrl =
			encodeURI( templateResponse[ 'astra-site-wxr-path' ] ) || '';
		if ( 'null' === wxrUrl || '' === wxrUrl ) {
			const errorTxt = __(
				'The XML URL for the site content is empty.',
				'astra-sites'
			);
			report(
				__( 'Importing Site Content Failed', 'astra-sites' ),
				'',
				errorTxt,
				'',
				astraSitesVars.support_text,
				wxrUrl
			);
			return;
		}

		dispatch( {
			type: 'set',
			importStatus: __( 'Importing Site Content.', 'astra-sites' ),
		} );

		const content = new FormData();
		content.append( 'action', 'astra-sites-import-prepare-xml' );
		content.append( 'wxr_url', wxrUrl );
		content.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		fetch( ajaxurl, {
			method: 'post',
			body: content,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				try {
					const data = JSON.parse( text );
					percentage += 2;
					dispatch( {
						type: 'set',
						importPercent: percentage,
					} );
					if ( false === data.success ) {
						const errorMsg = data.data.error || data.data;
						throw errorMsg;
					} else {
						// Import XML though Event Source.
						sseImport.data = data.data;
						sseImport.render( dispatch, percentage );

						const evtSource = new EventSource( sseImport.data.url );
						evtSource.onmessage = function ( message ) {
							const eventData = JSON.parse( message.data );
							switch ( eventData.action ) {
								case 'updateDelta':
									sseImport.updateDelta(
										eventData.type,
										eventData.delta
									);
									break;

								case 'complete':
									if ( false === eventData.error ) {
										evtSource.close();
										importSiteOptions();
									} else {
										report(
											astraSitesVars.xml_import_interrupted_primary,
											'',
											astraSitesVars.xml_import_interrupted_error,
											'',
											astraSitesVars.xml_import_interrupted_secondary
										);
									}
									break;
							}
						};

						evtSource.onerror = function () {
							evtSource.close();
							throw __(
								'Importing Site Content Failed. - Import Process Interrupted',
								'astra-sites'
							);
						};

						evtSource.addEventListener(
							'log',
							function ( message ) {
								const eventLogData = JSON.parse( message.data );
								let importMessage = eventLogData.message || '';
								if (
									importMessage &&
									'info' === eventLogData.level
								) {
									importMessage = importMessage.replace(
										/"/g,
										function () {
											return '';
										}
									);
								}

								dispatch( {
									type: 'set',
									importStatus: sprintf(
										// translators: Response importMessage
										__( 'Importing - %1$s', 'astra-sites' ),
										importMessage
									),
								} );
							}
						);
					}
				} catch ( error ) {
					report(
						__(
							'Importing Site Content failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Importing Site Content Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	/**
	 * 6. Import Site Option table values.
	 */
	const importSiteOptions = () => {
		dispatch( {
			type: 'set',
			importStatus: __( 'Importing Site Options.', 'astra-sites' ),
		} );

		const siteOptions = new FormData();
		siteOptions.append( 'action', 'astra-sites-import-options' );
		siteOptions.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		fetch( ajaxurl, {
			method: 'post',
			body: siteOptions,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						percentage += 5;
						dispatch( {
							type: 'set',
							importPercent: percentage,
						} );
						importWidgets();
					}
				} catch ( error ) {
					report(
						__(
							'Importing Site Options failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Importing Site Options Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	/**
	 * 7. Import Site Widgets.
	 */
	const importWidgets = () => {
		if ( ! widgetImportFlag ) {
			dispatch( {
				type: 'set',
				importPercent: 90,
			} );
			customizeWebsite();
			return;
		}
		dispatch( {
			type: 'set',
			importStatus: __( 'Importing Widgets.', 'astra-sites' ),
		} );

		const widgetsData = templateResponse[ 'astra-site-widgets-data' ] || '';

		const widgets = new FormData();
		widgets.append( 'action', 'astra-sites-import-widgets' );
		widgets.append( 'widgets_data', widgetsData );
		widgets.append( '_ajax_nonce', astraSitesVars._ajax_nonce );

		fetch( ajaxurl, {
			method: 'post',
			body: widgets,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						dispatch( {
							type: 'set',
							importPercent: 90,
						} );
						customizeWebsite();
					}
				} catch ( error ) {
					report(
						__(
							'Importing Widgets failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Importing Widgets Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	const customizeWebsite = async () => {
		await setSiteLogo( siteLogo );
		await setColorPalettes( JSON.stringify( activePalette ) );
		const selectedTypo = typography;
		await saveTypography( selectedTypo );
		importDone();
	};

	/**
	 * 9. Final setup - Invoking Batch process.
	 */
	const importDone = () => {
		dispatch( {
			type: 'set',
			importStatus: __( 'Final finishings.', 'astra-sites' ),
		} );

		const finalSteps = new FormData();
		finalSteps.append( 'action', 'astra-sites-import-end' );
		finalSteps.append( '_ajax_nonce', astraSitesVars._ajax_nonce );
		let counter = 3;

		fetch( ajaxurl, {
			method: 'post',
			body: finalSteps,
		} )
			.then( ( response ) => response.text() )
			.then( ( text ) => {
				let cloneData = [];
				try {
					const data = JSON.parse( text );
					cloneData = data;
					if ( data.success ) {
						dispatch( {
							type: 'set',
							importPercent: 100,
							importEnd: true,
						} );

						localStorage.setItem( 'st-import-end', +new Date() );
						setInterval( function () {
							counter--;
							const counterEl = document.getElementById(
								'redirect-counter'
							);
							if ( counterEl ) {
								if ( counter < 0 ) {
									dispatch( {
										type: 'set',
										currentIndex: currentIndex + 1,
									} );
								} else {
									const timeType =
										counter <= 1 ? ' second…' : ' seconds…';
									counterEl.innerHTML = counter + timeType;
								}
							}
						}, 1000 );
					}
				} catch ( error ) {
					report(
						__(
							'Final finishings failed due to parse JSON error.',
							'astra-sites'
						),
						'',
						error,
						'',
						'',
						text
					);

					dispatch( {
						type: 'set',
						importPercent: 100,
						importEnd: true,
					} );

					localStorage.setItem( 'st-import-end', +new Date() );
					setInterval( function () {
						counter--;
						const counterEl = document.getElementById(
							'redirect-counter'
						);
						if ( counterEl ) {
							if ( counter < 0 ) {
								dispatch( {
									type: 'set',
									currentIndex: currentIndex + 1,
								} );
							} else {
								const counterText =
									counter <= 1 ? ' second…' : ' seconds…';
								counterEl.innerHTML = counter + counterText;
							}
						}
					}, 1000 );
				}

				if ( false === cloneData.success ) {
					throw cloneData.data;
				}
			} )
			.catch( ( error ) => {
				report(
					__( 'Final finishings Failed.', 'astra-sites' ),
					'',
					error
				);
			} );
	};

	useEffect( () => {
		if ( tryAgainCount > 0 ) {
			checkRequiredPlugins( storedState );
		}
	}, [ tryAgainCount ] );

	// Start the pre import process.
	useEffect( () => {
		if ( importStart || importEnd ) {
			return;
		}
		if ( ! importError ) {
			localStorage.setItem( 'st-import-start', +new Date() );
			resetOldSite();
		}
	}, [ templateResponse ] );

	// Start the pre import process.
	useEffect( () => {
		if ( importStart || importEnd ) {
			return;
		}

		if ( templateResponse === null ) {
			dispatch( {
				type: 'set',
				importStatus: __(
					'Invalid demo selected. Please contact us.',
					'astra-sites'
				),
			} );
			return;
		}

		if (
			! (
				resetCustomizer &&
				resetSiteOptions &&
				resetContent &&
				resetWidgets &&
				resetDone
			)
		) {
			return;
		}

		dispatch( {
			type: 'set',
			resetDone: true,
		} );

		if ( themeActivateFlag ) {
			installAstra( storedState );
		} else {
			dispatch( {
				type: 'set',
				themeStatus: true,
			} );
		}
	}, [
		resetCustomizer,
		resetSiteOptions,
		resetContent,
		resetWidgets,
		resetDone,
		templateResponse,
	] );

	const preventRefresh = ( event ) => {
		event.returnValue = __(
			'Are you sure you want to cancel the site import process?',
			'astra-sites'
		);
		return event;
	};

	useEffect( () => {
		window.addEventListener( 'beforeunload', preventRefresh ); // eslint-disable-line @wordpress/no-global-event-listener
		return () =>
			window.removeEventListener( 'beforeunload', preventRefresh ); // eslint-disable-line @wordpress/no-global-event-listener
	} );

	// Start the import process.
	useEffect( () => {
		/**
		 * Do not process when Import is already going on.
		 */
		if ( importStart || importEnd ) {
			return;
		}

		/**
		 * Start the import process when following creteria to be fulfilled.
		 *
		 * 1. Theme should be installed
		 * 2. Reset is done.
		 * 3. Business Images are downloaded
		 *
		 */
		if ( ! ( themeStatus && resetDone ) ) {
			if ( importEnd ) {
				setTimeout( () => {
					dispatch( {
						type: 'set',
						currentIndex: currentIndex + 1,
					} );
				}, 5000 );
				dispatch( {
					type: 'set',
					importStatus: __(
						'Import is already done.',
						'astra-sites'
					),
				} );
			}
			if ( importStart && ! importEnd ) {
				dispatch( {
					type: 'set',
					importStatus: __(
						'Import is already in progress.',
						'astra-sites'
					),
				} );
			}
			return;
		}
		if ( null === templateResponse ) {
			report( __( 'Fetching related demo failed.', 'astra-sites' ) );
			return;
		}
		if ( ! importError ) {
			startImport();
		}
	}, [ themeStatus, resetDone, templateResponse ] );

	useEffect( () => {
		if ( requiredPluginsDone && resetDone && themeStatus ) {
			importCartflowsFlows();
		}
	}, [ requiredPluginsDone, resetDone, themeStatus ] );

	useEffect( () => {
		if ( notActivatedList.length <= 0 && notInstalledList.length <= 0 ) {
			dispatch( {
				type: 'set',
				requiredPluginsDone: true,
			} );
		}
	}, [ notActivatedList.length, notInstalledList.length ] );

	useEffect( () => {
		// Installed all required plugins.
		if ( notActivatedList.length > 0 ) {
			activatePlugin( notActivatedList[ 0 ] );
		}
	}, [ notActivatedList.length ] );

	return (
		<DefaultStep
			content={
				<div className="middle-content middle-content-import">
					<>
						<h1>
							{ __(
								'We are building your website…',
								'astra-sites'
							) }
						</h1>
						{ importError && (
							<div className="ist-import-process-step-wrap">
								<ErrorScreen />
							</div>
						) }
						{ ! importError && (
							<>
								<div className="ist-import-process-step-wrap">
									<ImportLoader />
								</div>
								<Lottie
									loop
									animationData={ lottieJson }
									play
									style={ {
										height: 400,
										margin: '-70px auto -90px auto',
									} }
								/>
							</>
						) }
					</>
				</div>
			}
			actions={
				<>
					<PreviousStepLink before disabled customizeStep={ true }>
						{ __( 'Back', 'astra-sites' ) }
					</PreviousStepLink>
				</>
			}
		/>
	);
};

export default ImportSite;
