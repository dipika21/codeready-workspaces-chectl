/*********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { expect, test } from '@oclif/test'
import * as execa from 'execa'

import { E2eHelper } from './util/e2e'

const helper = new E2eHelper()
jest.setTimeout(600000)

const PLATFORM = 'openshift'
const binChectl = `${process.cwd()}/bin/run`

describe('CodeReady Workspaces deploy test suite', () => {
  describe('server:start using operator and self signed certificates', () => {
    it('server:start using operator and self signed certificates', async () => {
      const command = `${binChectl} server:start --platform=${PLATFORM} --che-operator-cr-patch-yaml=test/e2e/util/cr-test.yaml --tls --installer=operator`
      const { exitCode, stdout, stderr } = await execa(command, { shell: true })

      expect(exitCode).equal(0)
      console.log(stdout)

      if (exitCode !== 0) {
        console.log(stderr)
      }
    })
  })
  test
    .it('Obtain access_token from keycloak and set it like environment variable.', async () => {
      try {
        const token = await helper.getAccessToken(PLATFORM)
        process.env.CHE_ACCESS_TOKEN = token
        console.log(token)
      } catch (error) {
        console.log(error)
      }
    })
})

describe('Export CA certificate', () => {
  it('Export CA certificate', async () => {
    const command = `${binChectl} cacert:export`

    const { exitCode, stdout, stderr } = await execa(command, { timeout: 30000, shell: true })

    expect(exitCode).equal(0)
    console.log(stdout)

    if (exitCode !== 0) {
      console.log(stderr)
    }
  })
})

describe('Workspace creation, list, start, inject, delete. Support stop and delete commands for CodeReady Workspaces server', () => {
  describe('Create Workspace', () => {
    test
      .stdout({ print: true })
      .stderr({ print: true })
      .command(['workspace:create', '--devfile=test/e2e/util/devfile-example.yaml'])
      .exit(0)
      .it('Create a workspace and wait to be started')
  })

  describe('Start Workspace', () => {
    it('Start a workspace using execa library', async () => {
      const workspaceId = await helper.getWorkspaceId(PLATFORM)
      const command = `${binChectl} workspace:start ${workspaceId}`

      const { exitCode, stdout, stderr } = await execa(command, { timeout: 30000, shell: true })

      expect(exitCode).equal(0)
      console.log(stdout)

      await helper.SleepTests(200000)
      if (exitCode !== 0) {
        console.log(stderr)
      }

      const workspaceStatus = await helper.getWorkspaceStatus(PLATFORM)

      expect(workspaceStatus).to.contain('RUNNING')
    })
  })

  describe('Inject kubeconfig to workspaces', () => {
    it('Inject kubeconfig to workspaces', async () => {
      const command = `${binChectl} workspace:inject --kubeconfig`

      const { exitCode, stdout, stderr } = await execa(command, { timeout: 30000, shell: true })

      expect(exitCode).equal(0)
      console.log(stdout)

      if (exitCode !== 0) {
        console.log(stderr)
      }
    })
  })

  describe('List Workspace', () => {
    test
      .stdout({ print: true })
      .stderr({ print: true })
      .command(['workspace:list'])
      .it('List workspaces')
  })

  describe('Stop Workspace', () => {
    it('Stop a workspace using execa library', async () => {
      const workspaceId = await helper.getWorkspaceId(PLATFORM)
      const command = `${binChectl} workspace:stop ${workspaceId}`

      const { exitCode, stdout, stderr } = await execa(command, { timeout: 30000, shell: true })
      expect(exitCode).equal(0)

      console.log(stdout)

      if (exitCode !== 0) {
        console.log(stderr)
      }
    })
  })

  describe('Delete Workspace', () => {
    it('Delete a workspace using execa library', async () => {
      const workspaceId = await helper.getWorkspaceId(PLATFORM)
      const token = await helper.getAccessToken(PLATFORM)
      const command = `${binChectl} workspace:delete ${workspaceId} --access-token=${token}`

      const { exitCode, stdout, stderr } = await execa(command, { timeout: 30000, shell: true })
      expect(exitCode).equal(0)

      console.log(stdout)

      if (exitCode !== 0) {
        console.log(stderr)
      }
    })
  })

  describe('Stop CodeReady Workspaces Server', () => {
    it('server:stop command coverage', async () => {
      const token = await helper.getAccessToken(PLATFORM)
      const command = `${binChectl} server:stop --access-token=${token} --skip-kubernetes-health-check`
      const { exitCode, stdout, stderr } = await execa(command, { shell: true })

      expect(exitCode).equal(0)
      console.log(stdout)

      if (exitCode !== 0) {
        console.log(stderr)
      }
    })
  })

  describe('Delete CodeReady Workspaces Server', () => {
    test
      .stdout()
      .stderr({ print: true })
      .command(['server:delete', '--skip-deletion-check'])
      .exit(0)
      .it('deletes CodeReady Workspaces resources on minishift successfully')
  })
})
