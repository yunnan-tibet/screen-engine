import React from 'react';
import { Button, Form, Input } from 'antd';

const FormItem = Form.Item;

interface ILoginPageProps {
  handleOk?: (e: ILoginParams) => void;
}

const LoginForm = (props: ILoginPageProps) => {
  const { handleOk } = props;
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (handleOk) {
        handleOk(values);
      }
    });
  };

  return (
    <Form form={form}>
      <div className="login-label">账户</div>
      <FormItem name="name" rules={[{ required: true, message: '请输入账户' }]}>
        <Input placeholder="请输入账号" />
      </FormItem>
      <div className="login-label">密码</div>
      <FormItem
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input placeholder="请输入密码" type="password" />
      </FormItem>
      <div className="login-btn">
        <Button type="primary" htmlType="submit" onClick={handleSubmit}>
          登录
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
