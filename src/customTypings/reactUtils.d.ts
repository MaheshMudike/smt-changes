import * as ReactOld from 'react';

declare module 'react' {
    
    export interface WithChildren {
        children?: React.ReactNode;
        //children?: JSX.Element | JSX.Element[] | string;        
		//children?: ReactOld.ReactNode[];
    }
    
    //type SomeComponent<T> = ReactOld.StatelessComponent<T> | ReactOld.ComponentClass<T>;

//    interface FormEvent {
        //target: ReactOld.HTMLInputElement;
  //  }
}
