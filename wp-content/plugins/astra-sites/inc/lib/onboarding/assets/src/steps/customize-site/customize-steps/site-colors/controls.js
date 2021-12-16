import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import Button from '../../../../components/button/button';
import { useStateValue } from '../../../../store/store';
import ColorPalettes from '../../../../components/color-palettes/color-palettes';
import {
	sendPostMessage,
	getDefaultColorPalette,
	getColorScheme,
} from '../../../../utils/functions';
import PreviousStepLink from '../../../../components/util/previous-step-link/index';

export const DARK_PALETTES = [
	{
		slug: 'style-1',
		title: __( 'Style 1', 'astra-sites' ),
		colors: [
			'#8E43F0',
			'#7215EA',
			'#FFFFFF',
			'#FAF5FF',
			'#726C7A',
			'#3C2F4B',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-2',
		title: __( 'Style 2', 'astra-sites' ),
		colors: [
			'#FFB72B',
			'#FF9900',
			'#FFFFFF',
			'#F9F5EE',
			'#6D6A64',
			'#3A362D',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-3',
		title: __( 'Style 3', 'astra-sites' ),
		colors: [
			'#FF2459',
			'#D90336',
			'#FFFFFF',
			'#FAF4F6',
			'#6B6365',
			'#352A2D',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-4',
		title: __( 'Style 4', 'astra-sites' ),
		colors: [
			'#2B60E8',
			'#0A43D7',
			'#FFFFFF',
			'#F7F7FA',
			'#64666C',
			'#2E323E',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-5',
		title: __( 'Style 5', 'astra-sites' ),
		colors: [
			'#1BAE70',
			'#008D52',
			'#FFFFFF',
			'#F3FAF7',
			'#5C6461',
			'#26312C',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-6',
		title: __( 'Style 6', 'astra-sites' ),
		colors: [
			'#FF8F3F',
			'#EC6300',
			'#FFFFFF',
			'#F9F6F4',
			'#66625F',
			'#37302A',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
];

export const LIGHT_PALETTES = [
	{
		slug: 'style-1',
		title: __( 'Style 1', 'astra-sites' ),
		colors: [
			'#8E43F0',
			'#7215EA',
			'#3C2F4B',
			'#726C7A',
			'#FAF5FF',
			'#FFFFFF',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-2',
		title: __( 'Style 2', 'astra-sites' ),
		colors: [
			'#FFB72B',
			'#FF9900',
			'#3A362D',
			'#6D6A64',
			'#F9F5EE',
			'#FFFFFF',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-3',
		title: __( 'Style 3', 'astra-sites' ),
		colors: [
			'#FF2459',
			'#D90336',
			'#352A2D',
			'#6B6365',
			'#FAF4F6',
			'#FFFFFF',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-4',
		title: __( 'Style 4', 'astra-sites' ),
		colors: [
			'#2B60E8',
			'#0A43D7',
			'#2E323E',
			'#64666C',
			'#F7F7FA',
			'#FFFFFF',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-5',
		title: __( 'Style 5', 'astra-sites' ),
		colors: [
			'#1BAE70',
			'#008D52',
			'#26312C',
			'#5C6461',
			'#F3FAF7',
			'#FFFFFF',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
	{
		slug: 'style-6',
		title: __( 'Style 6', 'astra-sites' ),
		colors: [
			'#FF8F3F',
			'#EC6300',
			'#37302A',
			'#66625F',
			'#F9F6F4',
			'#FFFFFF',
			'#000000',
			'#4B4F58',
			'#F6F7F8',
		],
	},
];

const SiteColorsControls = () => {
	const [
		{ activePaletteSlug, templateResponse, currentCustomizeIndex },
		dispatch,
	] = useStateValue();
	const [ defaultPalette, setDefaultPalette ] = useState( [] );
	const [ colorScheme, setColorScheme ] = useState( LIGHT_PALETTES );

	const onPaletteChange = ( event, palette ) => {
		if ( ! palette ) {
			return;
		}

		dispatch( {
			type: 'set',
			activePaletteSlug: palette.slug,
			activePalette: palette,
		} );

		sendPostMessage( {
			param: 'colorPalette',
			data: palette,
		} );
	};

	const nextStep = () => {
		dispatch( {
			type: 'set',
			currentCustomizeIndex: currentCustomizeIndex + 1,
		} );
	};

	useEffect( () => {
		const defaultPaletteValues = getDefaultColorPalette( templateResponse );
		setDefaultPalette( defaultPaletteValues );
		const scheme =
			'light' === getColorScheme( templateResponse )
				? LIGHT_PALETTES
				: DARK_PALETTES;
		setColorScheme( scheme );
	}, [ templateResponse ] );

	const lastStep = () => {
		dispatch( {
			type: 'set',
			// currentIndex: currentIndex - 1,
			currentCustomizeIndex: currentCustomizeIndex - 1,
		} );
	};

	return (
		<>
			{ defaultPalette ? (
				<>
					<ColorPalettes
						selected={ activePaletteSlug }
						options={ defaultPalette }
						onChange={ ( event, palette ) => {
							onPaletteChange( event, palette );
						} }
						tabIndex="0"
					/>
				</>
			) : (
				''
			) }
			<h4 className="ist-secondary-heading">
				{ __( 'You can also try:', 'astra-sites' ) }
			</h4>

			<ColorPalettes
				selected={ activePaletteSlug }
				options={ colorScheme }
				onChange={ ( event, palette ) => {
					onPaletteChange( event, palette );
				} }
				tabIndex="0"
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

export default SiteColorsControls;
