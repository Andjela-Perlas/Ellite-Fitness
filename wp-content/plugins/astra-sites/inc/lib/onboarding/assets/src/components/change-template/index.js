import React from 'react';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useStateValue } from '../../store/store';
import './style.scss';
import ICONS from '../../../icons';

const ChangeTemplate = () => {
	const [
		{ selectedTemplateName, currentIndex },
		dispatch,
	] = useStateValue();

	const goToShowcase = () => {
		dispatch( {
			type: 'set',
			currentIndex: currentIndex - 1,
			currentCustomizeIndex: 0,
		} );
	};

	return (
		<div className="change-template-wrap">
			<div className="template-name">
				<p className="label">
					{ __( 'Selected Template:', 'astra-sites' ) }
				</p>
				<h5>{ decodeEntities( selectedTemplateName ) }</h5>
			</div>
			<div className="change-btn-wrap" onClick={ goToShowcase }>
				<span className="change-btn">{ ICONS.cross }</span>
			</div>
		</div>
	);
};
export default ChangeTemplate;
