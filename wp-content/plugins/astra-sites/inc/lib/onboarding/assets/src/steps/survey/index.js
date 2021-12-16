import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Tooltip } from '@brainstormforce/starter-templates';
import { PreviousStepLink, DefaultStep } from '../../components/index';
import ICONS from '../../../icons';
import { useStateValue } from '../../store/store';
import SurveyForm from './survey';
import AdvancedSettings from './advanced-settings';
import './style.scss';

const Survey = () => {
	const [
		{ currentIndex, builder, requiredPlugins, analyticsFlag },
		dispatch,
	] = useStateValue();

	const thirtPartyPlugins =
		requiredPlugins !== null
			? requiredPlugins.third_party_required_plugins
			: [];
	const isThirtPartyPlugins = thirtPartyPlugins.length > 0;

	const [ skipPlugins, setSkipPlugins ] = useState( isThirtPartyPlugins );

	const compatibilities = astraSitesVars.compatibilities;
	const requirementsErrors = compatibilities.errors;
	let requirementWarning = compatibilities.warnings;

	if (
		requiredPlugins &&
		requiredPlugins.update_avilable_plugins.length > 0
	) {
		const updatePluginsList = [];
		requiredPlugins.update_avilable_plugins.map( ( plugin ) => {
			return updatePluginsList.push( plugin.name );
		} );

		const output = [ '<ul>' ];
		updatePluginsList.forEach( function ( item ) {
			output.push( '<li>' + item + '</li>' );
		} );
		output.push( '</ul>' );

		const tooltipString =
			astraSitesVars.compatibilities_data[ 'update-available' ];
		tooltipString.tooltip = tooltipString.tooltip.replace(
			'##LIST##',
			output.join( '' )
		);

		requirementWarning = {
			...requirementWarning,
			'update-available': tooltipString,
		};
	}

	const [ showRequirementCheck, setShowRequirementCheck ] = useState(
		Object.keys( requirementsErrors ).length > 0 ||
			Object.keys( requirementWarning ).length > 0
	);

	const [ formDetails, setFormDetails ] = useState( {
		first_name: '',
		email: '',
		wp_user_type: '',
		build_website_for: '',
	} );

	const updateFormDetails = ( field, value ) => {
		setFormDetails( ( prevState ) => ( {
			...prevState,
			[ field ]: value,
		} ) );
	};

	const handleSurveyFormSubmit = ( e ) => {
		e.preventDefault();

		setTimeout( () => {
			dispatch( {
				type: 'set',
				currentIndex: currentIndex + 1,
			} );
		}, 500 );

		if ( starterTemplates.analytics !== 'yes' ) {
			// Send data to analytics.
			const answer = analyticsFlag ? 'yes' : 'no';
			const optinAnswer = new FormData();
			optinAnswer.append( 'action', 'astra-sites-update-analytics' );
			optinAnswer.append( '_ajax_nonce', astraSitesVars._ajax_nonce );
			optinAnswer.append( 'data', answer );

			fetch( ajaxurl, {
				method: 'post',
				body: optinAnswer,
			} )
				.then( ( response ) => response.json() )
				.then( ( response ) => {
					if ( response.success ) {
						starterTemplates.analytics = answer;
					}
				} );
		}

		if ( astraSitesVars.subscribed === 'yes' ) {
			dispatch( {
				type: 'set',
				user_subscribed: true,
			} );
			return;
		}

		const subscriptionFields = {
			EMAIL: formDetails.email,
			FIRSTNAME: formDetails.first_name,
			PAGE_BUILDER: builder,
			WP_USER_TYPE: formDetails.wp_user_type,
			BUILD_WEBSITE_FOR: formDetails.build_website_for,
		};

		const content = new FormData();
		content.append( 'action', 'astra-sites-update-subscription' );
		content.append( '_ajax_nonce', astraSitesVars._ajax_nonce );
		content.append( 'data', JSON.stringify( subscriptionFields ) );

		fetch( ajaxurl, {
			method: 'post',
			body: content,
		} )
			.then( ( response ) => response.json() )
			.then( () => {
				dispatch( {
					type: 'set',
					user_subscribed: true,
				} );
			} );
	};

	const handlePluginFormSubmit = ( e ) => {
		e.preventDefault();
		setSkipPlugins( false );
	};

	const surveyForm = () => {
		return (
			<form className="survey-form" onSubmit={ handleSurveyFormSubmit }>
				<h1>{ __( 'Okay, just one last step…', 'astra-sites' ) }</h1>
				{ astraSitesVars.subscribed !== 'yes' && (
					<SurveyForm updateFormDetails={ updateFormDetails } />
				) }
				{ <AdvancedSettings /> }
				<button
					type="submit"
					className="submit-survey-btn button-text d-flex-center-align"
				>
					{ __( 'Submit & Build My Website', 'astra-sites' ) }
					{ ICONS.arrowRight }
				</button>
			</form>
		);
	};

	const thirdPartyPluginList = () => {
		return (
			<form
				className="required-plugins-form"
				onSubmit={ handlePluginFormSubmit }
			>
				<h1>{ __( 'Required plugins missing', 'astra-sites' ) }</h1>
				<p>
					{ __(
						"This starter template requires premium plugins. As these are third party premium plugins, you'll need to purchase, install and activate them first.",
						'astra-sites'
					) }
				</p>
				<h5>{ __( 'Required plugins -', 'astra-sites' ) }</h5>
				<ul className="third-party-required-plugins-list">
					{ thirtPartyPlugins.map( ( plugin, index ) => {
						return (
							<li
								data-slug={ plugin.slug }
								data-init={ plugin.init }
								data-name={ plugin.name }
								key={ index }
							>
								<a
									href={ plugin.link }
									target="_blank"
									rel="noreferrer"
								>
									{ plugin.name }
								</a>
							</li>
						);
					} ) }
				</ul>
				<button
					type="submit"
					className="submit-survey-btn button-text d-flex-center-align"
				>
					{ __( 'Skip & Start Importing', 'astra-sites' ) }
					{ ICONS.arrowRight }
				</button>
			</form>
		);
	};

	const requirementCheck = () => {
		return (
			<div className="requirement-check-wrap">
				<h1>{ __( "We're Almost There!", 'astra-sites' ) }</h1>

				<p>
					{ __(
						"You're close to importing the template. To complete the process, please clear the following conditions.",
						'astra-sites'
					) }
				</p>

				<ul className="requirement-check-list">
					{ Object.keys( requirementsErrors ).length > 0 &&
						Object.values( requirementsErrors ).map(
							( value, index ) => {
								return (
									<li key={ index }>
										<div className="requirement-list-item">
											{ value.title }
											<Tooltip
												content={
													<span
														dangerouslySetInnerHTML={ {
															__html:
																value.tooltip,
														} }
													/>
												}
											>
												{ ICONS.questionMark }
											</Tooltip>
										</div>
									</li>
								);
							}
						) }
					{ Object.keys( requirementWarning ).length > 0 &&
						Object.values( requirementWarning ).map(
							( value, index ) => {
								return (
									<li key={ index }>
										<div className="requirement-list-item">
											{ value.title }
											<Tooltip
												content={
													<span
														dangerouslySetInnerHTML={ {
															__html:
																value.tooltip,
														} }
													/>
												}
											>
												{ ICONS.questionMark }
											</Tooltip>
										</div>
									</li>
								);
							}
						) }
				</ul>
				<button
					className="submit-survey-btn button-text d-flex-center-align"
					onClick={ () => setShowRequirementCheck( false ) }
					disabled={
						Object.keys( requirementsErrors ).length > 0
							? true
							: false
					}
				>
					{ __( 'Skip & Continue', 'astra-sites' ) }
					{ ICONS.arrowRight }
				</button>
			</div>
		);
	};

	return (
		<DefaultStep
			content={
				<>
					<div className="survey-container">
						{ showRequirementCheck && requirementCheck() }
						{ ! showRequirementCheck && (
							<>
								{ skipPlugins && thirdPartyPluginList() }
								{ ! skipPlugins && surveyForm() }
							</>
						) }
					</div>
				</>
			}
			actions={
				<>
					<PreviousStepLink before>
						{ __( 'Back', 'astra-sites' ) }
					</PreviousStepLink>
				</>
			}
		/>
	);
};

export default Survey;
