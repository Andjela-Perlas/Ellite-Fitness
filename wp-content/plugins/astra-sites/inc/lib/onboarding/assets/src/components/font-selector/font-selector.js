import React from 'react';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import Button from '../../components/button/button';
import { useStateValue } from '../../store/store';
import './style.scss';
import PreviousStepLink from '../../components/util/previous-step-link/index';

const Typography = styled.span`
	line-height: normal;
	color: var( --st-color-body );
	font-size: var( --st-font-size-m );
	${ ( props ) =>
		props.large &&
		`
        font-size: var(--st-font-size-m);
        color: var( --st-color-heading );
		margin-bottom: 10px;
		font-weight:${ props.weight };
	` }

	${ ( props ) =>
		props.font &&
		`
		font-family: ${ props.font };
		font-weight:${ props.weight };
	` }
`;

const List = ( { className, options, onSelect, selected } ) => {
	const handleKeyPress = ( e, id ) => {
		e = e || window.event;

		if ( e.keyCode === 37 ) {
			//Left Arrow
			if ( e.target.previousSibling ) {
				e.target.previousSibling.focus();
			}
		} else if ( e.keyCode === 39 ) {
			//Right Arrow
			if ( e.target.nextSibling ) {
				e.target.nextSibling.focus();
			}
		} else if ( e.key === 'Enter' ) {
			//Enter
			onSelect( e, id );
		}
	};

	return (
		<ul className={ `ist-font-selector ${ className }` }>
			{ Object.keys( options ).map( ( index ) => {
				const bodyFont =
					getFontName( options[ index ][ 'body-font-family' ] ) || '';
				const headingFont =
					getFontName(
						options[ index ][ 'headings-font-family' ],
						bodyFont
					) || '';
				const bodyFontWeight = options[ index ][ 'body-font-weight' ];
				const headingFontWeight =
					options[ index ][ 'headings-font-weight' ];
				const id = options[ index ].id;

				return (
					<li
						className={ `
						ist-font
						${ id === selected ? 'active' : '' }
						` }
						key={ id }
						onClick={ ( event ) => {
							onSelect( event, id );
						} }
						tabIndex="0"
						onKeyDown={ ( event ) => {
							handleKeyPress( event, id );
						} }
					>
						{
							<>
								{ headingFont ? (
									<Typography
										font={ headingFont }
										weight={ headingFontWeight }
										large
									>
										{ headingFont }
									</Typography>
								) : (
									''
								) }
								<span className="font-separator">/</span>
								{ bodyFont ? (
									<Typography
										font={ bodyFont }
										weight={ bodyFontWeight }
									>
										{ bodyFont }
									</Typography>
								) : (
									''
								) }
							</>
						}
					</li>
				);
			} ) }
		</ul>
	);
};

export const getFontName = ( fontName, inheritFont ) => {
	if ( ! fontName ) {
		return '';
	}

	if ( fontName ) {
		const matches = fontName.match( /'([^']+)'/ );

		if ( matches ) {
			return matches[ 1 ];
		} else if ( 'inherit' === fontName ) {
			return inheritFont;
		}

		return fontName;
	}

	if ( inheritFont ) {
		return inheritFont;
	}
};

const FontSelector = ( { options, onSelect, selected } ) => {
	const [
		{
			currentIndex,
			currentCustomizeIndex,
			templateResponse,
			licenseStatus,
			importError,
			builder,
		},
		dispatch,
	] = useStateValue();

	const fonts = options.map( ( font, index ) => {
		font.id = index;
		return font;
	} );
	const defaultFonts = fonts.filter( ( font ) => font.default );
	const otherFonts = fonts.filter( ( font ) => ! font.default );
	let premiumTemplate = false;

	const nextStep = () => {
		if ( ! importError ) {
			premiumTemplate = 'free' !== templateResponse[ 'astra-site-type' ];

			if ( premiumTemplate && ! licenseStatus ) {
				if ( astraSitesVars.isPro ) {
					dispatch( {
						type: 'set',
						validateLicenseStatus: true,
						currentCustomizeIndex: currentCustomizeIndex + 1,
					} );
				} else {
					dispatch( {
						type: 'set',
						currentCustomizeIndex: currentCustomizeIndex + 1,
					} );
				}
			} else {
				dispatch( {
					type: 'set',
					currentIndex: currentIndex + 1,
				} );
			}
		}
	};

	const lastStep = () => {
		if ( builder === 'beaver-builder' || builder === 'brizy' ) {
			dispatch( {
				type: 'set',
				currentCustomizeIndex: currentCustomizeIndex - 2,
			} );
		} else {
			dispatch( {
				type: 'set',
				currentCustomizeIndex: currentCustomizeIndex - 1,
			} );
		}
	};

	return (
		<>
			<h4 className="ist-default-fonts-heading">
				{ __( 'Default Fonts:', 'astra-sites' ) }
			</h4>
			<List
				className="ist-default-fonts"
				options={ defaultFonts }
				onSelect={ onSelect }
				selected={ selected }
			/>
			<h4 className="ist-secondary-heading">
				{ __( 'You can also try:', 'astra-sites' ) }
			</h4>
			<List
				className="ist-other-fonts"
				options={ otherFonts }
				onSelect={ onSelect }
				selected={ selected }
			/>

			<Button className="ist-button" onClick={ nextStep } after>
				{ __( 'Continue', 'astra-sites' ) }
			</Button>
			<PreviousStepLink customizeStep={ true } onClick={ lastStep }>
				{ __( 'Back', 'astra-sites' ) }
			</PreviousStepLink>
		</>
	);
};

export default FontSelector;
