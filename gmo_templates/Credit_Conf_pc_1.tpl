<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

	<meta http-equiv="Content-Type" content="text/html; charset=shift_jis" />
	<meta http-equiv="Content-style-Type" content="text/html; charset=Shift_JIS" />
	<title>�N���W�b�g���ϊm�F�e���v���[�g�T���v���@�o�f�}���`�y�C�����g�T�[�r�X</title>
	
	<link href="{$CSSPATH}/common.css" rel="stylesheet" type="text/css" />
	
	{literal}
	<script type="text/javascript">
		var submitted = false
		function blockForm(){
			if( submitted ){
				return false
			}
			submitted = true
			return true
		}
	</script>
	{/literal}
	
</head>
<body>

<div class="wrapper">
<div class="bodyinner">

	<!--�w�b�_�[�J�n-->
	<div class="header">
		<h1>{$ShopName|htmlspecialchars } ���x���葱��</h1>
	</div>

	<div class="flow">
		<ul>
			<li class="active">
				<a href="{$CancelURL|htmlspecialchars}">
					<span>�V���b�s���O�T�C�g�ɖ߂� &lt;</span>
				</a>
			</li>
			{if $SelectURL ne null}
			<li  class="active">
				<a href="{$SelectURL|htmlspecialchars}">
					<span>���x�����@�̑I�� &gt;</span>
				</a>
			</li>
			{/if}
			<li  class="active">
				<a href="{$EntryURL|htmlspecialchars}">
				<span>�K�v�������L�� &gt;</span>
				</a>
			</li>
			<li class="current">
				<span>�m�F���Ď葱�� &gt;</span>
			</li>
			<li>
				<span>���x���葱������</span>
			</li>
		</ul>
	</div>
	
	<div class="main">

		{if  $CheckMessageArray neq null }
		<div id="GP_msg">
			<ul>
			{foreach item=message from=$CheckMessageArray}
				<li>{$message}</li>
			{/foreach}
			</ul>
		</div>
		{/if}
	
		<form action="{$ExecURL|htmlspecialchars}" onsubmit="return blockForm()" method="post">
		
			<p>{insert name="input_keyItems"}</p>
						
			<div class="block">
				<div class="bl_title">
					<div class="bl_title_inner">
						<h2>
							<span class="p">���L�̓��e�Ō��ς��܂��B��낵����΁A�u���ς���v�{�^���������Ă��������B</span>
						</h2>
					</div>
				</div>
				
				<div class="bl_body">
					
					<table class="generic" summary="credit_1" id="credit">
						<tr>
							<th class="td_bl2">�x�����@</th>
							<td>{$MethodName|htmlspecialchars}</td>
						</tr>
						<tr>
							<th class="td_bl2">������</th>
							<td>{$PayTimes|htmlspecialchars}</td>
						</tr>
						<tr>
							<th class="td_bl2">�J�[�h�ԍ�</th>
							<td>{$CardNo|htmlspecialchars}</td>
						</tr>
						<tr>
							<th class="td_bl2">�J�[�h�L������(MM/YY)</th>
							<td>{$ExpireMonth|htmlspecialchars}/{$ExpireYear|htmlspecialchars}</td>
						</tr>
					
					</table>
					
					<p class="control">
						<span class="submit">
							<input type="submit" value="���ς���" />
						</span>
					</p>
				</div>
			</div>
			
			<div class="block">
				<div class="bl_title">
					<div class="bl_title_inner">
						<h2>
							<span class="p">�����p���e</span>
						</h2>
					</div>
				</div>
				
				<div class="bl_body">
		
					<div>
						<table id="cartinfo" class="generic">
							<tr>
								<th>���i��</th>
								<td>{$Amount|number_format|htmlspecialchars}�~</td>
							</tr>
							<tr>
								<th>�ő���</th>
								<td>{$Tax|number_format|htmlspecialchars}�~</td>
							</tr>
							<tr>
								<th>���x�����v</th>
								<td>{$Total|number_format|htmlspecialchars}�~</td>
							</tr>
						</table>
					</div>
					
				</div>
				
			</div>
			
			<br class="clear" />
			
		</form>
	</div>

</div>
{* �f�o�b�O���K�v�ȏꍇ�A�ȉ��̍s�� * ���폜���āA�R�����g���O���Ă��������B *}
{*insert name="debug_showAllVars"*}
</body>
</html>