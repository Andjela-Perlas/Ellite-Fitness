import LicenseValidation from './license-validation';
import LicenseValidationControls from './license-validation/controls';
import BusinessLogo from './business-logo';
import BusinessLogoControls from './business-logo/controls';
import SiteColors from './site-colors';
import SiteColorsControls from './site-colors/controls';
import SiteTypography from './site-typography';
import SiteTypographyControls from './site-typography/controls';

export const CustomizeSteps = [
	{
		content: BusinessLogo,
		controls: BusinessLogoControls,
		class: 'customize-business-logo',
	},
	{
		content: SiteColors,
		controls: SiteColorsControls,
		actions: null,
		class: 'customize-site-colors',
	},
	{
		content: SiteTypography,
		controls: SiteTypographyControls,
		actions: null,
		class: 'customize-site-typography',
	},
	{
		content: LicenseValidation,
		controls: LicenseValidationControls,
		actions: null,
		class: 'customize-license-validation',
	},
];
