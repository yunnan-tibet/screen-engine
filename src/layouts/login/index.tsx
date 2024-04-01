import React from 'react';
import { useDispatch, useSelector } from 'umi';
import LoginForm from './loginForm';
import './index.less';
import { IAppState } from '@/models';

const bannerSource = require('@/assets/img/banner.jpg');

const Login = () => {
  const dispatch = useDispatch();
  const { name } = useSelector((state: IAppState) => state.user);
  const handleSubmit = (values: ILoginParams) => {
    dispatch({
      type: 'user/getUserInfo',
    });
  };

  return (
    <div className="layout-login">
      <div className="login-wrap">
        <div className="login-info">
          <div className="project-name">{name}</div>
          <div className="login-content">
            <div className="login-banner">
              <img src={bannerSource} />
            </div>
            <div className="login-form">
              <div className="login-title">账号密码登录</div>
              <LoginForm handleOk={handleSubmit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
