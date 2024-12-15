/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { EnvironmentsPage } from './components/EnvironmentsPage';

export class PluginEnvironmentsClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.app.pluginSettingsManager.add('environments', {
      title: `{{t("Environments", { ns: "environments" })}}`,
      icon: 'TableOutlined',
      Component: EnvironmentsPage,
    });
  }
}

export default PluginEnvironmentsClient;
