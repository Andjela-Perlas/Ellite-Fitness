import React from 'react';
import './style.scss';

const ColorPalettes = ( { selected, options, onChange, tabIndex } ) => {
	const handleKeyPress = ( e, palette ) => {
		e = e || window.event;

		if ( e.keyCode === 38 ) {
			//Up Arrow
			if ( e.target.previousSibling ) {
				e.target.previousSibling.focus();
			}
		} else if ( e.keyCode === 40 ) {
			//Down Arrow
			if ( e.target.nextSibling ) {
				e.target.nextSibling.focus();
			}
		} else if ( e.key === 'Enter' ) {
			//Enter
			onChange( e, palette );
		}
	};

	return (
		<div className="ist-color-palettes">
			{ Object.values( options ).map( ( palette, paletteIndex ) => {
				const title = palette.title || '';
				const firstColor = palette.colors[ 0 ] || '';
				const secondColor = palette.colors[ 1 ] || '';
				const thirdColor = palette.colors[ 2 ] || '';
				const fourthColor = palette.colors[ 3 ] || '';
				const fifthColor = palette.colors[ 4 ] || '';

				return (
					<div
						key={ paletteIndex }
						className={ `ist-color-palette ${
							palette.slug === selected
								? 'ist-color-palette-active'
								: ''
						}` }
						onClick={ ( event ) => {
							onChange( event, palette );
						} }
						onKeyDown={ ( event ) => {
							handleKeyPress( event, palette );
						} }
						tabIndex={ tabIndex }
					>
						<div className="ist-color-icon-wrap">
							<div className="ist-color-icon d-flex-center-align">
								{ palette.slug === selected ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 17 14"
										fill="none"
									>
										<path
											d="M7.10541 13.1484C6.96069 13.3166 6.71038 13.3295 6.54918 13.1769L0.455484 7.40945C0.294286 7.2569 0.287277 7.00022 0.439738 6.83902L2.38122 4.78749C2.53377 4.62629 2.79045 4.61928 2.95165 4.77174L6.28039 7.92208C6.44159 8.07463 6.6919 8.0618 6.83662 7.89359L13.3398 0.337456C13.4845 0.169249 13.7407 0.150044 13.9088 0.294858L16.0494 2.13731C16.2176 2.28204 16.2368 2.53817 16.092 2.70638L7.10541 13.1484Z"
											fill="white"
										/>
									</svg>
								) : (
									''
								) }
							</div>
						</div>
						<div className="ist-colors-title">{ title }</div>
						<div className="ist-colors-list">
							<div
								className="ist-palette-color"
								style={ { backgroundColor: firstColor } }
							/>
							<div
								className="ist-palette-color"
								style={ { backgroundColor: secondColor } }
							/>
							<div
								className="ist-palette-color"
								style={ {
									backgroundColor: thirdColor,
								} }
							/>
							<div
								className="ist-palette-color"
								style={ {
									backgroundColor: fourthColor,
								} }
							/>
							<div
								className="ist-palette-color"
								style={ {
									backgroundColor: fifthColor,
								} }
							/>
						</div>
					</div>
				);
			} ) }
		</div>
	);
};

export default ColorPalettes;
