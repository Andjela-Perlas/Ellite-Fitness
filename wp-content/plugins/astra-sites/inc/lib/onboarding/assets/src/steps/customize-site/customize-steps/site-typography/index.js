import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useStateValue } from '../../../../store/store';
import ChangeTemplate from '../../../../components/change-template';

const SiteTypography = () => {
	const [
		{ licenseStatus, selectedTemplateType },
		dispatch,
	] = useStateValue();
	useEffect( () => {
		dispatch( {
			type: 'set',
			designStep: 3,
		} );
	}, [] );

	return (
		<>
			<ChangeTemplate />
			<div className="customizer-header">
				<div className="header-name">
					{ ! licenseStatus && 'free' !== selectedTemplateType && (
						<p className="premium-notice">
							{ __(
								'This is a Premium Template',
								'astra-sites'
							) }
						</p>
					) }
					<h3 className="ist-customizer-heading">
						{ __( 'Fonts', 'astra-sites' ) }
					</h3>
					<p className="screen-description">
						{ __(
							'Choose fonts for your site. You can update them anytime later.',
							'astra-sites'
						) }
					</p>
				</div>
			</div>
		</>
	);
};

export default SiteTypography;
