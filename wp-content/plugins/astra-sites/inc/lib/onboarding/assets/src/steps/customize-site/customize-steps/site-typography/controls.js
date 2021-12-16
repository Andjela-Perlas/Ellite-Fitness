import React, { useEffect, useState } from 'react';
import { useStateValue } from '../../../../store/store';
import { FontSelector } from '../../../../components/index';
import {
	sendPostMessage,
	getDefaultTypography,
	getHeadingFonts,
} from '../../../../utils/functions';

const getFontName = ( fontName, inheritFont ) => {
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

export const FONTS = [
	{
		'body-font-family': "'Open Sans', sans-serif",
		'body-font-variant': '400',
		'body-font-weight': '400',
		'font-size-body': {
			desktop: 16,
			tablet: '',
			mobile: '',
			'desktop-unit': 'px',
			'tablet-unit': 'px',
			'mobile-unit': 'px',
		},
		'body-line-height': '1.7',
		'headings-font-family': "'Playfair Display', serif",
		'headings-font-weight': '700',
		'headings-line-height': '1.2',
		'headings-font-variant': '700',
	},
	{
		'body-font-family': "'Lora', serif",
		'body-font-variant': '400',
		'body-font-weight': '400',
		'font-size-body': {
			desktop: 16,
			tablet: '',
			mobile: '',
			'desktop-unit': 'px',
			'tablet-unit': 'px',
			'mobile-unit': 'px',
		},
		'body-line-height': '',
		'headings-font-family': "'Lato', sans-serif",
		'headings-font-weight': '700',
		'headings-line-height': '1.2',
		'headings-font-variant': '700',
	},
	{
		'body-font-family': "'Roboto', sans-serif",
		'body-font-variant': '400',
		'body-font-weight': '400',
		'font-size-body': {
			desktop: 17,
			tablet: '',
			mobile: '',
			'desktop-unit': 'px',
			'tablet-unit': 'px',
			'mobile-unit': 'px',
		},
		'body-line-height': '',
		'headings-font-family': "'Barlow Condensed', sans-serif",
		'headings-font-weight': '600',
		'headings-line-height': '1.2',
		'headings-font-variant': '600',
	},
	{
		'body-font-family': "'Source Sans Pro', sans-serif",
		'body-font-variant': '400',
		'body-font-weight': '400',
		'font-size-body': {
			desktop: 17,
			tablet: '',
			mobile: '',
			'desktop-unit': 'px',
			'tablet-unit': 'px',
			'mobile-unit': 'px',
		},
		'body-line-height': 1.7,
		'headings-font-family': "'Montserrat', sans-serif",
		'headings-font-weight': '700',
		'headings-line-height': '1.3',
		'headings-font-variant': '700',
	},
	{
		'body-font-family': "'Karla', sans-serif",
		'body-font-variant': '400',
		'body-font-weight': '400',
		'font-size-body': {
			desktop: 17,
			tablet: '',
			mobile: '',
			'desktop-unit': 'px',
			'tablet-unit': 'px',
			'mobile-unit': 'px',
		},
		'body-line-height': '',
		'headings-font-family': "'Rubik', sans-serif",
		'headings-font-weight': '500',
		'headings-line-height': '1.3',
		'headings-font-variant': '500',
	},
	{
		'body-font-family': "'Work Sans', sans-serif",
		'body-font-variant': '400',
		'body-font-weight': '400',
		'font-size-body': {
			desktop: 16,
			tablet: '',
			mobile: '',
			'desktop-unit': 'px',
			'tablet-unit': 'px',
			'mobile-unit': 'px',
		},
		'body-line-height': '',
		'headings-font-family': "'DM Serif Display', serif",
		'headings-font-weight': '400',
		'headings-line-height': '1.2',
		'headings-font-variant': '400',
	},
];

const SiteTypographyControls = () => {
	const [
		{ typographyIndex, typography, templateResponse },
		dispatch,
	] = useStateValue();
	let [ fonts, setFonts ] = useState( FONTS );
	const [ headingFonts, setHeadingFonts ] = useState( [] );

	/**
	 * Add selected demo typograply as default typography
	 */
	useEffect( () => {
		if ( templateResponse !== null ) {
			const defaultFonts = [];
			const defaultTypography = getDefaultTypography( templateResponse );
			const head = getHeadingFonts( templateResponse );
			setHeadingFonts( head );

			defaultFonts.push( defaultTypography );

			if ( ! document.getElementById( 'google-fonts-domain' ) ) {
				const node = document.createElement( 'link' );
				node.id = 'google-fonts-domain';
				node.setAttribute( 'rel', 'preconnect' );
				node.setAttribute( 'href', 'https://fonts.gstatic.com' );
				document.head.appendChild( node );
			}

			if ( ! document.getElementById( 'google-fonts-url' ) ) {
				const node = document.createElement( 'link' );
				node.id = 'google-fonts-url';
				node.setAttribute( 'rel', 'stylesheet' );

				const fontsName = [];

				let bodyFont = defaultTypography[ 'body-font-family' ] || '';
				let bodyFontWeight =
					parseInt( defaultTypography[ 'body-font-weight' ] ) || '';
				if ( bodyFontWeight ) {
					bodyFontWeight = `:wght@${ bodyFontWeight }`;
				}

				if ( bodyFont ) {
					bodyFont = getFontName( bodyFont );
					bodyFont = bodyFont.replace( ' ', '+' );
					fontsName.push( `family=${ bodyFont }${ bodyFontWeight }` );
				}

				let headingFont =
					defaultTypography[ 'headings-font-family' ] || '';
				let headingFontWeight =
					parseInt( defaultTypography[ 'headings-font-weight' ] ) ||
					'';

				if ( headingFontWeight ) {
					headingFontWeight = `:wght@${ headingFontWeight }`;
				}

				if ( headingFont ) {
					headingFont = getFontName( headingFont, bodyFont );
					headingFont = headingFont.replace( ' ', '+' );
					fontsName.push(
						`family=${ headingFont }${ headingFontWeight }`
					);
				}

				let otherFontsString = '';
				if ( !! fonts ) {
					for ( const font of fonts ) {
						const fontHeading = getFontName(
							font[ 'headings-font-family' ]
						).replaceAll( ' ', '+' );
						const fontHeadingWeight =
							font[ 'headings-font-weight' ];

						const fontBody = getFontName(
							font[ 'body-font-family' ]
						).replaceAll( ' ', '+' );
						const fontBodyWeight = font[ 'body-font-weight' ];

						otherFontsString += `&family=${ fontHeading }:wght@${ fontHeadingWeight }&family=${ fontBody }:wght@${ fontBodyWeight }`;
					}
					otherFontsString = otherFontsString.replace(
						/[&]{1}$/i,
						''
					);
				}

				if ( fontsName ) {
					const fontUrl = `https://fonts.googleapis.com/css2?${ fontsName.join(
						'&'
					) }${ otherFontsString }&display=swap`;

					node.setAttribute( 'href', fontUrl );
					document.head.appendChild( node );
				}
			}

			if ( 0 === typographyIndex ) {
				dispatch( {
					type: 'set',
					typography: defaultTypography,
				} );
			}

			// Set default font.
			fonts = defaultFonts.concat( fonts );

			setFonts( fonts );
		}
	}, [ templateResponse ] );

	/**
	 * Display selected typography
	 */
	useEffect( () => {
		const newTypography = { ...typography, ...headingFonts };

		sendPostMessage( {
			param: 'siteTypography',
			data: JSON.parse( JSON.stringify( newTypography ) ),
		} );
	}, [ typography ] );

	return (
		<>
			<FontSelector
				selected={ typographyIndex }
				options={ fonts }
				onSelect={ ( event, selectedFont ) => {
					dispatch( {
						type: 'set',
						typographyIndex: selectedFont,
						typography: fonts[ selectedFont ] || fonts[ 0 ],
					} );
				} }
			/>
		</>
	);
};

export default SiteTypographyControls;
