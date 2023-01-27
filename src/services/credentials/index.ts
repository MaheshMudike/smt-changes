import { ICredentials } from '../../models/api/salesforce/ICredentials';
import CachedValue from '../storage/CachedValue';
import * as secureStorage from '../storage/secureStorage';

const credentials = new CachedValue(secureStorage.valueForKey<ICredentials>('CREDENTIALS-' + __SMT_ENV__));

export default credentials;