import React from 'react';
import { Redirect } from 'umi';

const IndexPage = () => <Redirect from="/index.html" to="template/two" />;
export default IndexPage;
