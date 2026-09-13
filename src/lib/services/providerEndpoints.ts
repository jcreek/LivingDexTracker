import { getEnv } from '$lib/utils/env';

export function getProviderEndpoints() {
	const env = getEnv();
	return {
		google: {
			authorize: env.GOOGLE_OAUTH_AUTHORIZE_URL || 'https://accounts.google.com/o/oauth2/v2/auth',
			token: env.GOOGLE_OAUTH_TOKEN_URL || 'https://oauth2.googleapis.com/token',
			driveApi: env.GOOGLE_DRIVE_API_URL || 'https://www.googleapis.com/drive/v3',
			driveUpload: env.GOOGLE_DRIVE_UPLOAD_URL || 'https://www.googleapis.com/upload/drive/v3'
		},
		dropbox: {
			authorize: env.DROPBOX_OAUTH_AUTHORIZE_URL || 'https://www.dropbox.com/oauth2/authorize',
			token: env.DROPBOX_OAUTH_TOKEN_URL || 'https://api.dropbox.com/oauth2/token',
			upload: env.DROPBOX_UPLOAD_URL || 'https://content.dropboxapi.com/2/files/upload'
		}
	};
}
