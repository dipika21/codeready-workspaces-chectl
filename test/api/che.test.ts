/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { CoreV1Api } from '@kubernetes/client-node'
import { expect, fancy } from 'fancy-test'

import { CheHelper } from '../../src/api/che'
import { KubeHelper } from '../../src/api/kube'

const namespace = 'che'
const workspace = 'workspace-0123'
const cheURL = 'https://che-che.192.168.64.34.nip.io'
const devfileServerURL = 'https://devfile-server'
const devfileEndpoint = '/api/workspace/devfile'
let ch = new CheHelper({})
let kube = ch.kube
let oc = ch.oc
let k8sApi = new CoreV1Api()

describe('CodeReady Workspaces helper', () => {
  describe('cheURL', () => {
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(kube, 'isOpenShift', () => false)
      .stub(kube, 'ingressExist', () => true)
      .stub(kube, 'getIngressProtocol', () => 'https')
      .stub(kube, 'getIngressHost', () => 'example.org')
      .it('computes CodeReady Workspaces URL on K8s', async () => {
        const cheURL = await ch.cheURL('che-namespace')
        expect(cheURL).to.equals('https://example.org')
      })
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(kube, 'isOpenShift', () => false)
      .stub(kube, 'ingressExist', () => false)
      .do(() => ch.cheURL('che-namespace'))
      .catch(err => expect(err.message).to.match(/ERR_INGRESS_NO_EXIST/))
      .it('fails fetching CodeReady Workspaces URL when ingress does not exist')
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(kube, 'isOpenShift', () => true)
      .stub(oc, 'routeExist', () => true)
      .stub(oc, 'getRouteProtocol', () => 'https')
      .stub(oc, 'getRouteHost', () => 'example.org')
      .it('computes CodeReady Workspaces URL on OpenShift', async () => {
        const cheURL = await ch.cheURL('che-namespace')
        expect(cheURL).to.equals('https://example.org')
      })
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(kube, 'isOpenShift', () => true)
      .stub(oc, 'routeExist', () => false)
      .do(() => ch.cheURL('che-namespace'))
      .catch(/ERR_ROUTE_NO_EXIST/)
      .it('fails fetching CodeReady Workspaces URL when route does not exist')
    fancy
      .stub(ch, 'cheNamespaceExist', () => false)
      .do(() => ch.cheURL('che-namespace'))
      .catch(err => expect(err.message).to.match(/ERR_NAMESPACE_NO_EXIST/))
      .it('fails fetching CodeReady Workspaces URL when namespace does not exist')
  })
  describe('isCheServerReady', () => {
    fancy
      .nock(cheURL, api => api
        .get('/api/system/state')
        .reply(200))
      .it('detects if CodeReady Workspaces server is ready', async () => {
        const res = await ch.isCheServerReady(cheURL)
        expect(res).to.equal(true)
      })
    fancy
      .nock(cheURL, api => api
        .get('/api/system/state')
        .delayConnection(1000)
        .reply(200))
      .it('detects if CodeReady Workspaces server is NOT ready', async () => {
        const res = await ch.isCheServerReady(cheURL, 500)
        expect(res).to.equal(false)
      })
    fancy
      .nock(cheURL, api => api
        .get('/api/system/state')
        .delayConnection(1000)
        .reply(200))
      .it('waits until CodeReady Workspaces server is ready', async () => {
        const res = await ch.isCheServerReady(cheURL, 2000)
        expect(res).to.equal(true)
      })
    fancy
      .nock(cheURL, api => api
        .get('/api/system/state')
        .reply(404)
        .get('/api/system/state')
        .reply(503)
        .get('/api/system/state')
        .reply(200))
      .it('continues requesting until CodeReady Workspaces server is ready', async () => {
        const res = await ch.isCheServerReady(cheURL, 2000)
        expect(res).to.equal(true)
      })
    fancy
      .nock(cheURL, api => api
        .get('/api/system/state')
        .reply(404)
        .get('/api/system/state')
        .reply(404)
        .get('/api/system/state')
        .reply(503))
      .it('continues requesting but fails if CodeReady Workspaces server is NOT ready after timeout', async () => {
        const res = await ch.isCheServerReady(cheURL, 20)
        expect(res).to.equal(false)
      })
  })
  describe('cheNamespaceExist', () => {
    fancy
      .stub(KubeHelper.KUBE_CONFIG, 'makeApiClient', () => k8sApi)
      .stub(k8sApi, 'readNamespace', jest.fn().mockImplementation(() => { throw new Error() }))
      .it('founds out that a namespace doesn\'t exist', async () => {
        const res = await ch.cheNamespaceExist(namespace)
        expect(res).to.equal(false)
      })
    fancy
      .stub(KubeHelper.KUBE_CONFIG, 'makeApiClient', () => k8sApi)
      .stub(k8sApi, 'readNamespace', () => ({ response: '', body: { metadata: { name: `${namespace}` } } }))
      .it('founds out that a namespace does exist', async () => {
        const res = await ch.cheNamespaceExist(namespace)
        expect(res).to.equal(true)
      })
  })
  describe('createWorkspaceFromDevfile', () => {
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(ch, 'cheURL', () => cheURL)
      .nock(cheURL, api => api
        .post(devfileEndpoint)
        .replyWithFile(201, __dirname + '/replies/create-workspace-from-valid-devfile.json', { 'Content-Type': 'application/json' }))
      .it('succeds creating a workspace from a valid devfile', async () => {
        const res = await ch.createWorkspaceFromDevfile(namespace, __dirname + '/requests/devfile.valid', undefined)
        expect(res.links!.ide).to.equal('https://che-che.192.168.64.39.nip.io/che/crwctl')
      })
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(ch, 'cheURL', () => cheURL)
      .nock(cheURL, api => api
        .post(devfileEndpoint)
        .replyWithFile(400, __dirname + '/replies/create-workspace-from-invalid-devfile.json', {
          'Content-Type': 'application/json'
        }))
      .do(() => ch.createWorkspaceFromDevfile(namespace, __dirname + '/requests/devfile.invalid', undefined))
      .catch(/E_BAD_DEVFILE_FORMAT/)
      .it('fails creating a workspace from an invalid devfile')
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(ch, 'cheURL', () => cheURL)
      .do(() => ch.createWorkspaceFromDevfile(namespace, __dirname + '/requests/devfile.inexistent', undefined))
      .catch(/E_NOT_FOUND_DEVFILE/)
      .it('fails creating a workspace from a non-existing devfile')
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(ch, 'cheURL', () => cheURL)
      .nock(devfileServerURL, api => api
        .get('/devfile.yaml')
        .replyWithFile(200, __dirname + '/requests/devfile.valid', { 'Content-Type': 'text/plain; charset=utf-8' }))
      .nock(cheURL, api => api
        .post(devfileEndpoint)
        .replyWithFile(201, __dirname + '/replies/create-workspace-from-valid-devfile.json', { 'Content-Type': 'application/json' }))
      .it('succeeds creating a workspace from a remote devfile', async () => {
        const res = await ch.createWorkspaceFromDevfile(namespace, devfileServerURL + '/devfile.yaml', undefined)
        expect(res.links!.ide).to.equal('https://che-che.192.168.64.39.nip.io/che/crwctl')
      })
    fancy
      .stub(ch, 'cheNamespaceExist', () => true)
      .stub(ch, 'cheURL', () => cheURL)
      .nock(devfileServerURL, api => api
        .get('/devfile.yaml')
        .reply(404, '404 - Not Found'))
      .do(() => ch.createWorkspaceFromDevfile(namespace, devfileServerURL + '/devfile.yaml', undefined))
      .catch(/E_NOT_FOUND_DEVFILE/)
      .it('fails creating a workspace from a non-existing remote devfile')
  })
  describe('buildDashboardURL', () => {
    fancy
      .it('builds the Dashboard URL of a workspace given the IDE link', async () => {
        let ideURL = 'https://che-che.192.168.64.40.nip.io/che/name-with-dashes'
        let dashboardURL = 'https://che-che.192.168.64.40.nip.io/dashboard/#/ide/che/name-with-dashes'
        let res = await ch.buildDashboardURL(ideURL)
        expect(res).to.equal(dashboardURL)
      })
  })
  describe('getWorkspacePod', () => {
    fancy
      .stub(KubeHelper.KUBE_CONFIG, 'makeApiClient', () => k8sApi)
      .stub(k8sApi, 'listNamespacedPod', () => ({ response: '', body: { items: [{ metadata: { name: 'pod-name', labels: { 'che.workspace_id': workspace } } }] } }))
      .it('should return pod name where workspace with the given ID is running', async () => {
        const pod = await ch.getWorkspacePodName(namespace, workspace)
        expect(pod).to.equal('pod-name')
      })
    fancy
      .stub(KubeHelper.KUBE_CONFIG, 'makeApiClient', () => k8sApi)
      .stub(k8sApi, 'listNamespacedPod', () => ({ response: '', body: { items: [{ metadata: { labels: { 'che.workspace_id': `${workspace}1` } } }] } }))
      .do(() => ch.getWorkspacePodName(namespace, workspace))
      .catch(/Pod is not found for the given workspace ID/)
      .it('should fail if no workspace is found for the given ID')
  })
  describe('isAuthenticationEnabled', () => {
    fancy
      .nock(cheURL, api => api
        .get('/api/keycloak/settings')
        .replyWithFile(200, __dirname + '/replies/get-keycloak-settings.json', {
          'Content-Type': 'application/json'
        }))
      .it('should return true if the api/keycloak/settings endpoint doesn\'t exist', async () => {
        const authEnabled = await ch.isAuthenticationEnabled(cheURL)
        expect(authEnabled).to.equal(true)
      })
    fancy
      .nock(cheURL, api => api
        .get('/api/keycloak/settings')
        .reply(404, 'Page does not exist', {
          'Content-Type': 'text/plain'
        }))
      .it('should return false if the api/keycloak/settings endpoint doesn\'t exist', async () => {
        const authEnabled = await ch.isAuthenticationEnabled(cheURL)
        expect(authEnabled).to.equal(false)
      })
  })
})
