import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useStateValue } from '../../../../store/store';
import ChangeTemplate from '../../../../components/change-template';

const SiteColors = () => {
	const [
		{ licenseStatus, selectedTemplateType },
		dispatch,
	] = useStateValue();
	useEffect( () => {
		dispatch( {
			type: 'set',
			designStep: 2,
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
						{ __( 'Colors', 'astra-sites' ) }
					</h3>
					<p className="screen-description">
						{ __(
							'Choose colors for your site. You can update them anytime later.',
							'astra-sites'
						) }
					</p>
				</div>
			</div>
		</>
	);
};

export default SiteColors;
