import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: (): any => {
    return v2.config({
      cloud_name: 'daso1btiz',
      api_key: '468557256968463',
      api_secret: '3S13jGO6WJPZ6-ojNFRUZmeshaY',
    });
  },
};
