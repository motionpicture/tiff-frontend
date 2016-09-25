<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

	<meta http-equiv="Content-Type" content="text/html; charset=shift_jis" />
	<meta http-equiv="Content-style-Type" content="text/html; charset=Shift_JIS" />
	<title>�N���W�b�g���σ��V�[�g�e���v���[�g�T���v���@�o�f�}���`�y�C�����g�T�[�r�X</title>
	
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
			<li>
				<span>�V���b�s���O�T�C�g�ɖ߂� &lt;</span>
			</li>
			{if $SelectURL ne null}
			<li>
				<span>���x�����@�̑I�� &gt;</span>
			</li>
			{/if}
			<li>
				<span>�K�v�������L�� &gt;</span>
			</li>
			{if $Confirm eq "1"}
			<li>
				<span>�m�F���Ď葱�� &gt;</span>
			</li>
			{/if}
			<li class="current">
				<span>���x���葱������</span>
			</li>
		</ul>
	</div>
	
	<div class="main">
	
		<form action="{$RetURL|htmlspecialchars}" method="post" onsubmit="return blockForm()">
		
			<p>{insert name="input_returnParams"}</p>
			
			<p class="txt">���ς��������܂����B���ւ��i�݂��������B</p>
		
			<div class="block">
				<div class="bl_title">
					<div class="bl_title_inner">
						<h2>
							<span class="p">�����p���e</span>
						</h2>
					</div>
				</div>
				
				<div class="bl_body">
		
					<table class="generic">
					{if $JobCd != "CHECK" }
					  <tr>
					    <th>���z<br />Amount</th>
					    <td >{$Amount|number_format|htmlspecialchars}�~</td>
					  </tr>
					  {/if}
					  <tr>
					    <th>�x�����@<br />Type of payment</th>
					    <td >
					    	{$MethodName|htmlspecialchars}
							  {if $Method eq "2"}
						   	 /{$PayTimes|htmlspecialchars}��
						   	 {/if}
					   	 </td>
					  </tr>
					  <tr>
					    <th>�J�[�h�ԍ�<br />Amount</th>
					    <td >{$CardNo|htmlspecialchars}</td>
					  </tr>
					  <tr>
					    <th>�L������(MM/YY)<br />Expiration date (MM/YY)</th>
					    <td >{$ExpireMonth|htmlspecialchars}/{$ExpireYear|htmlspecialchars}</td>
					  </tr>
					</table>
					
					<p class="control">
						<span class="submit">
							<input type="submit" value="�i��" />
						</span>
					</p>
					<br class="clear" />	
				</div>
				
			</div>
		</form>
	</div>
		
</div>
</div>
{* �f�o�b�O���K�v�ȏꍇ�A�ȉ��̍s�� * ���폜���āA�R�����g���O���Ă��������B *}
{*insert name="debug_showAllVars"*}
</body>
</html>