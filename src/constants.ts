/*********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

export const DEFAULT_CHE_IMAGE = 'registry.redhat.io/codeready-workspaces/server-rhel8:2.3'
export const DEFAULT_CHE_OPERATOR_IMAGE = 'registry.redhat.io/codeready-workspaces/crw-2-rhel8-operator:2.3'

// This image should be updated manually when needed.
// Repository location: https://github.com/che-dockerfiles/che-cert-manager-ca-cert-generator-image
export const CA_CERT_GENERATION_JOB_IMAGE = 'quay.io/eclipse/che-cert-manager-ca-cert-generator:671342c'

export const CERT_MANAGER_NAMESPACE_NAME = 'cert-manager'
export const CHE_TLS_SECRET_NAME = 'che-tls'
export const CHE_ROOT_CA_SECRET_NAME = 'self-signed-certificate'
export const DEFAULT_CA_CERT_FILE_NAME = 'cheCA.crt'
export const CHE_CLUSTER_CR_NAME = 'codeready-workspaces'
export const CHE_CLUSTER_CRD = 'checlusters.org.eclipse.che'

// OLM
export const DEFAULT_CHE_OLM_PACKAGE_NAME = 'codeready-workspaces'
export const OLM_STABLE_CHANNEL_NAME = 'latest'
export const DEFAULT_OPENSHIFT_MARKET_PLACE_NAMESPACE = 'openshift-marketplace'
export const DEFAULT_OLM_KUBERNETES_NAMESPACE = 'olm'
export const CUSTOM_CATALOG_SOURCE_NAME = 'codeready-custom-catalog-source'
export const SUBSCRIPTION_NAME = 'codeready-subscription'
export const OPERATOR_GROUP_NAME = 'codeready-operator-group'
export const KUBERNETES_OLM_CATALOG = 'operatorhubio-catalog'
export const OPENSHIFT_OLM_CATALOG = 'redhat-operators'
export const CVS_PREFIX = 'crwoperator'

// Documentation links
export const DOCS_LINK_INSTALL_TLS_WITH_SELF_SIGNED_CERT = 'https://www.eclipse.org/che/docs/che-7/installing-che-in-tls-mode-with-self-signed-certificates/'
export const DOCS_LINK_IMPORT_CA_CERT_INTO_BROWSER = 'https://www.eclipse.org/che/docs/che-7/installing-che-in-tls-mode-with-self-signed-certificates/#using-che-with-tls_installing-che-in-tls-mode-with-self-signed-certificates'
export const DOCS_LINK_AUTH_TO_CHE_SERVER_VIA_OPENID = ' https://www.eclipse.org/che/docs/che-7/authenticating-users/#authenticating-to-the-che-server-using-openid_authenticating-to-the-che-server'
export const DOCS_LINK_HOW_TO_ADD_IDENTITY_PROVIDER_OS4 = 'https://docs.openshift.com/container-platform/4.1/authentication/understanding-identity-provider.html#identity-provider-overview_understanding-identity-provider'
export const DOCS_LINK_HOW_TO_CREATE_USER_OS3 = 'https://docs.openshift.com/container-platform/3.11/install_config/configuring_authentication.html'
